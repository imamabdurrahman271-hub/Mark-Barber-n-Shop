export function formatPhoneNumber(phone: string): string {
  // Hapus semua karakter non-digit
  let cleaned = phone.replace(/\D/g, '');
  
  // Jika dimulai dengan '08', ubah menjadi '628'
  if (cleaned.startsWith('08')) {
    cleaned = '628' + cleaned.slice(2);
  }
  
  // Jika dimulai dengan '8', tambahkan '62'
  if (cleaned.startsWith('8') && cleaned.length >= 9) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
}

export async function sendWhatsApp(target: string, message: string): Promise<{ success: boolean; error?: string }> {
  const token = process.env.FONNTE_API_TOKEN;
  if (!token) {
    console.warn('FONNTE_API_TOKEN is not configured in environment variables');
    return { success: false, error: 'Fonnte token not configured' };
  }

  const formattedTarget = formatPhoneNumber(target);

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token
      },
      body: new URLSearchParams({
        target: formattedTarget,
        message: message
      })
    });

    const data = await response.json();
    if (data.status === true) {
      return { success: true };
    } else {
      console.error('Fonnte API error response:', data);
      return { success: false, error: data.reason || 'Failed to send message via Fonnte' };
    }
  } catch (error) {
    console.error('Error sending Fonnte message:', error);
    return { success: false, error: String(error) };
  }
}
