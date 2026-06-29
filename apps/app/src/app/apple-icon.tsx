import { ImageResponse } from 'next/og';
import { Lettermark } from '@soustools/ui';

export const runtime = 'edge';

// Apple Touch Icon is 180x180
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#020617', // slate-950
          borderRadius: '20px',
        }}
      >
        <Lettermark color="#0095FF" width={120} height={120} />
      </div>
    ),
    {
      ...size,
    }
  );
}
