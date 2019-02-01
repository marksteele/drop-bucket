import { Storage } from "aws-amplify";

export async function s3Upload(file) {
  Storage.configure({ level: 'private' });
  const stored = await Storage.vault.put(file.name, file, {
    contentType: file.type
  });
  return stored.key;
}

export async function listFiles() {
  Storage.configure({ level: 'private' });
  const files = await Storage.vault.list('');
  return files;
}

export async function getUrl(file) {
  try {
    const url =  await Storage.vault.get(file,{ level: 'private', Expires: 86400*7});
    return url;  
  } catch (e) {
    console.log(e);
  }
}