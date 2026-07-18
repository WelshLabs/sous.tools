import React from "react";

export default function Link({ href, children, ...props }: any) {
  // If it's a pass-through component, we just render standard anchor tag
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
