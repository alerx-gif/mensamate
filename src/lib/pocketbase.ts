import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://db.endurnet.ch');

pb.autoCancellation(false);
