const getCryptoKey = async (key: string): Promise<CryptoKey> => {
  const encoder = new TextEncoder();

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key).slice(0, 32),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
  return cryptoKey;
};
export const encryptPassword = async (
  text: string,
  key: string,
): Promise<string> => {
  const encoder = new TextEncoder();

  const cryptoKey = await getCryptoKey(key);

  // nonce makes sure the ciphertext is unique let be same input text and algorithm
  // ciphertext = AES(key + nonce + plaintext)
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    cryptoKey,
    encoder.encode(text),
  );

  const nonceBase64 = btoa(String.fromCharCode(...nonce));
  const cipherTextBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encrypted)),
  );

  return `${nonceBase64}:${cipherTextBase64}`;
};
export const decryptPassword = async (
  combined: string,
  key: string,
): Promise<string> => {
  const encoder = new TextEncoder();

  const cryptoKey = await getCryptoKey(key);

  const [nonceBase64, cipherTextBase64] = combined.split(":");

  const nonce = Uint8Array.from(atob(nonceBase64), (c) => c.charCodeAt(0));
  const cipherText = Uint8Array.from(atob(cipherTextBase64), (c) =>
    c.charCodeAt(0),
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    cryptoKey,
    cipherText,
  );

  const decoder = new TextDecoder();

  return decoder.decode(decrypted);
};
