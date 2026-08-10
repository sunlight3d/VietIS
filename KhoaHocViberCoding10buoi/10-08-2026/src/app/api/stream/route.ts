import { eventEmitter } from '@/lib/eventEmitter';

// Next.js App Router route configuration for SSE
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Write initial SSE headers conceptually (NextResponse handles this via init headers)
  
  const sendEvent = async (data: any) => {
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch (err) {
      console.error('Error writing SSE event', err);
    }
  };

  const onTaskChanged = () => {
    sendEvent({ type: 'TASK_CHANGED', timestamp: Date.now() });
  };

  eventEmitter.on('task_changed', onTaskChanged);

  // Send an initial heartbeat
  sendEvent({ type: 'CONNECTED', timestamp: Date.now() });

  req.signal.addEventListener('abort', () => {
    eventEmitter.off('task_changed', onTaskChanged);
    writer.close().catch(() => {});
  });

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      // CORS headers if needed for mobile to connect directly to IP
      'Access-Control-Allow-Origin': '*',
    },
  });
}
