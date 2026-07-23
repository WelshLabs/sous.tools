#!/bin/bash -e

# Install wl-mirror dependencies
apt-get install -y cmake meson wayland-protocols libwayland-dev libgles2-mesa-dev pkg-config

rm -rf /tmp/wl-mirror

# Clone and build wl-mirror
git clone https://github.com/Ferdi265/wl-mirror.git /tmp/wl-mirror
cd /tmp/wl-mirror
mkdir build && cd build
cmake ..
make && make install

if [ ! -d "${ROOTFS_DIR}" ]; then
	copy_previous
fi
