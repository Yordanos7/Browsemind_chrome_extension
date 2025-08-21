export function sendMessage(type: string, payload: any): Promise<any> {
  return chrome.runtime.sendMessage({ type, payload });
}
