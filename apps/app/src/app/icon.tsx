import { ImageResponse } from 'next/og';
import { MicroIcon } from '@soustools/ui';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MicroIcon color="#0095FF" width={24} height={24} />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
