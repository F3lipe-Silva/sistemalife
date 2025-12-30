import { Client, Account, Functions, Databases, Storage } from 'appwrite';

const client = new Client()
    .setEndpoint('https://appwrite.nozdog.xyz/v1')
    .setProject('695179150010e5d6ac06');

export const account = new Account(client);
export const functions = new Functions(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { client };
