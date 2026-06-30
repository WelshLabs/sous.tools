import { ImageResponse } from 'next/og';
import { MicroIcon } from '@soustools/ui';

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
          background: 'transparent',
        }}
      >
        <MicroIcon color="#0095FF" width={130} height={130} />
      </div>
    ),
    {
      ...size,
    }
  );
}
