import type { APIRoute } from 'astro';

// Simple in-memory store for newsletter subscribers (replace with database in production)
const subscribers = new Set<string>();

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Please enter a valid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if already subscribed
    if (subscribers.has(email.toLowerCase())) {
      return new Response(JSON.stringify({ error: 'This email is already subscribed' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add subscriber
    subscribers.add(email.toLowerCase());

    // TODO: In production, you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Add to email service (SendGrid, Mailchimp, etc.)

    console.log(`New newsletter subscriber: ${email}`);
    console.log(`Total subscribers: ${subscribers.size}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully subscribed to newsletter' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Get subscriber count (for admin purposes)
export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  
  // Only admins can see subscriber count
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ 
    count: subscribers.size 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
