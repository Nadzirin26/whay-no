import { handleChat } from '../server/chat';

// Web-standard Node Function: reuse the safety pipeline without opening a port.
export default {
  fetch(request: Request): Promise<Response> {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    return handleChat(request, process.env, ip);
  },
};
