import { query } from '@solidjs/router';
import { createResource, ResourceSource } from 'solid-js';
import { buckets, supabase } from '~/lib/supabase';
import { TablesInsert, TablesUpdate } from '~/lib/supabase/database.types';


type FetchMapOptions = {
  transformBackgroundUrl?: boolean;
};

export function queryMaps<S>(source: ResourceSource<S>, options: FetchMapOptions = {}) {
  const { transformBackgroundUrl = true } = options;

  const resource = createResource(source, async () => {
    const result = await supabase.from('maps').select();
    if (transformBackgroundUrl) result.data?.forEach(map => {
      map.background_url = buckets.mapsAssets.getPublicUrl(map.background_url!, {
        transform: {
          height: 300, width: 300,
          resize: 'contain'
        }
      }).data.publicUrl;
    });
    return result;
  });

  const [, { mutate, refetch }] = resource;

  const deleteMutation = async (mapId: string | number) => {
    const result = await deleteMap(mapId);
    if (result.error) return result;

    return mutate(prev => {
      if (!prev) return prev;

      prev.data = prev!.data?.filter(map => map.id != mapId) ?? null;
      prev.count = prev!.count ? prev!.count - 1 : prev!.count ?? null;
      return { ...prev };
    });
  };

  const insertMutation = async (row: TablesInsert<'maps'>) => {
    const result = await insertMap(row);
    if (result.error) return result;
    return refetch(source);
  };

  return [resource[0], {
    ...resource[1],
    deleteMutation: deleteMutation,
    insertMutation: insertMutation
  }] as const;
}

// export const fetchMaps = query(async ({ transformBackgroundUrl = true }: FetchMapOptions = {}) => {
//   const { data, error, count } = await supabase.from('maps').select();

//   if (transformBackgroundUrl) data?.forEach(map => {
//     map.background_url = buckets.mapsAssets.getPublicUrl(map.background_url!, {
//       transform: {
//         height: 300, width: 300,
//         resize: 'contain'
//       }
//     }).data.publicUrl;
//   });

//   return { data, error, count };
// }, 'maps');

export const fetchMap = query(async (id: string, { transformBackgroundUrl = true }: FetchMapOptions = {}) => {
  const { data, error } = await supabase.from('maps').select().eq('id', parseInt(id)).single();

  if (transformBackgroundUrl && data?.background_url)
    data.background_url = buckets.mapsAssets.getPublicUrl(data.background_url).data.publicUrl;

  return { data, error };
}, 'map');

export const insertMap = (row: TablesInsert<'maps'>) => {
  return supabase.from('maps').insert(row).select('id').single();
};


export const updateMap = async (mapId: string | number, row: TablesUpdate<'maps'>) => {
  const id = typeof mapId == 'string' ? parseInt(mapId) : mapId;
  const { data, error } = await supabase.from('maps')
    .update(row)
    .eq('id', id);

  return { data, error };
};

export const deleteMap = async (mapId: string | number) => {
  const id = typeof mapId == 'string' ? parseInt(mapId) : mapId;
  return supabase.from('maps').delete().eq('id', id);
};