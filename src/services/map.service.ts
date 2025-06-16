import { query } from '@solidjs/router';
import { useSession } from '~/contexts/Session.context';
import { buckets, supabase } from '~/lib/supabase';
import { TablesInsert, TablesUpdate } from '~/lib/supabase/database.types';


type FetchMapOptions = {
  transformBackgroundUrl?: boolean;
};

// type PostgrestResponseSuccess<T> = Extract<PostgrestSingleResponse<T>, {
//   error: null;
//   data: T;
//   count: number | null;
// }>;
// type PostgrestResponseFailure = Extract<PostgrestSingleResponse<T>, {
//   error: PostgrestError;
//   data: null;
//   count: null;
// }>;

// /** @deprecated use {@link fetchMaps} with {@link createResource} instead */
// export function queryMaps<S>(source: ResourceSource<S>, options: FetchMapOptions = {}) {
//   const { transformBackgroundUrl = true } = options;

//   const resource = createResource(source, async () => {
//     const result = await supabase.from('maps').select();
//     if (transformBackgroundUrl) result.data?.forEach(map => {
//       map.background_url = buckets.mapsAssets.getPublicUrl(map.background_url!, {
//         transform: {
//           height: 300, width: 300,
//           resize: 'contain'
//         }
//       }).data.publicUrl;
//     });
//     return result;
//   });

//   const [, { mutate, refetch }] = resource;

//   const deleteMutation = async (mapId: string | number) => {
//     const result = await deleteMap(mapId);
//     if (result.error) return result;

//     mutate(prev => {
//       if (!prev) return prev;

//       const next = prev;
//       next.data = next.data?.filter(map => map.id != mapId) ?? null;
//       next.count = next.count ? next.count - 1 : next.count ?? null;
//       return { ...next } as PostgrestSingleResponse<Tables<'maps'>[]>;
//     });

//     return result;
//   };

//   const insertMutation = async (row: TablesInsert<'maps'>) => {
//     const result = await insertMap(row);
//     if (result.error) return result;
//     refetch(source);
//     return result;
//   };

//   return [resource[0], {
//     ...resource[1],
//     deleteMutation: deleteMutation,
//     insertMutation: insertMutation
//   }] as const;
// }

export const fetchMaps = query(async ({ transformBackgroundUrl = true }: FetchMapOptions = {}) => {
  const result = await supabase.from('maps').select();

  if (transformBackgroundUrl && result.data) result.data.forEach(map => {
    map.background_url = buckets.mapsAssets.getPublicUrl(map.background_url!, {
      transform: {
        height: 300, width: 300,
        resize: 'contain'
      }
    }).data.publicUrl;
  });

  return result;
}, 'map');

export const fetchMap = query(async (id: string, { transformBackgroundUrl = true }: FetchMapOptions = {}) => {
  const result = await supabase.from('maps').select().eq('id', parseInt(id)).single();

  if (transformBackgroundUrl && result.data?.background_url)
    result.data.background_url = buckets.mapsAssets.getPublicUrl(result.data.background_url).data.publicUrl;

  return result;
}, 'map');

type CreateMapPayload = Omit<TablesInsert<'maps'>, 'background_url'> & {
  backgroundFile: File;
};

export const createMap = async (payload: CreateMapPayload) => {
  const session = useSession();

  const uploadToBucket = async (userId: string, mapId: number, file: File) => {
    const path = `${userId}/${mapId}/${file.name}`;
    const { data, error } = await buckets.mapsAssets.upload(path, file);
    if (error) throw error;
    return data;
  };

  const updateMapBackgroundUrl = async (id: number, backgroundUrl: string) => {
    const { data, error } = await supabase.from('maps')
      .update({ background_url: backgroundUrl })
      .eq('id', id);
    if (error) throw error;
    return data;
  };

  // TODO: migrate all this logic to rpc {@link https://supabase.com/docs/reference/javascript/rpc}
  const { data, error } = await supabase.from('maps').insert({
    hex_tile_radius: payload.hex_tile_radius,
    tile_cost: payload.tile_cost,
    background_url: ""
  }).select('id').single();

  if (error) throw error;

  const mapId = data.id;
  try {
    const { path } = await uploadToBucket(session()!.user.id, mapId, payload.backgroundFile);

    try { await updateMapBackgroundUrl(mapId, path); }
    catch (err) {
      buckets.mapsAssets.remove([path]);
      throw err;
    }

  } catch (err) {
    await supabase.from('maps').delete().eq('id', mapId);
    throw err;
  }
};

export const updateMap = async (mapId: string | number, row: TablesUpdate<'maps'>) => {
  const id = typeof mapId == 'string' ? parseInt(mapId) : mapId;
  return await supabase.from('maps')
    .update(row)
    .eq('id', id);
};

export const deleteMap = async (mapId: string | number) => {
  const id = typeof mapId == 'string' ? parseInt(mapId) : mapId;
  return supabase.from('maps').delete().eq('id', id);
};