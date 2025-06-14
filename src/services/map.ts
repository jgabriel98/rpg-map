import { query } from '@solidjs/router';
import { buckets, supabase } from '~/lib/supabase';
import { TablesInsert, TablesUpdate } from '~/lib/supabase/database.types';


type FetchMapOptions = {
  transformBackgroundUrl?: boolean;
};

export const fetchMaps = query(async ({ transformBackgroundUrl = true }: FetchMapOptions = {}) => {
  const { data, error, count } = await supabase.from('maps').select();

  if (transformBackgroundUrl) data?.forEach(map => {
    map.background_url = buckets.mapsAssets.getPublicUrl(map.background_url!, {
      transform: {
        height: 300, width: 300,
        resize: 'contain'
      }
    }).data.publicUrl;
  });

  return { data, error, count };
}, 'map');

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