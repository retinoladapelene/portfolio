import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, ...rest } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing commission ID' }, { status: 400 });
    }

    const updates: any = {};

    // Handle Payment Proofs (Base64)
    for (const stage of ['75', '100']) {
      const base64Field = `payment${stage}Base64`;
      if (body[base64Field]) {
        const imageBase64 = body[base64Field];
        const match = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        
        if (match) {
          const contentType = match[1];
          const base64Data = match[2];
          const extension = contentType.split('/')[1];
          const fileName = `payment-${stage}-${id}-${Date.now()}.${extension}`;
          const filePath = `proofs/${fileName}`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from('portfolio')
            .upload(filePath, Buffer.from(base64Data, 'base64'), {
              contentType,
              upsert: true
            });

          if (uploadError) throw new Error(uploadError.message);

          updates[`payment_${stage}_proof_url`] = filePath;
          updates[`payment_${stage}_status`] = 'pending';
          
          // Implicitly approve previous WIP/Final if paying for next stage
          if (stage === '75') updates.wip_status = 'approved';
          if (stage === '100') updates.final_status = 'approved';
        }
      }
    }

    // Handle Direct Field Updates (feedback, notes, statuses)
    const allowedFields = [
      'sketch_status',
      'client_note',
      'wip_feedback', 'wip_status',
      'final_feedback', 'final_status',
      'dp_proof_url', 'dp_status'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid updates provided' }, { status: 400 });
    }

    const { data: updatedRecord, error: updateError } = await supabaseAdmin
      .from('commissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedRecord });

  } catch (error: any) {
    console.error('Update Progress Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
