
{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.nodePackages.pnpm
    pkgs.openssl
    pkgs.git
    pkgs.curl
    pkgs.jq
    pkgs.python3
    pkgs.pkg-config
    pkgs.libuv
    pkgs.nodePackages.node-gyp
    pkgs.gnumake
    pkgs.gcc
  ];
  
  env = {
    PYTHON_LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.stdenv.cc.cc.lib
      pkgs.zlib
      pkgs.glib
      pkgs.xorg.libX11
      pkgs.xorg.libXext
      pkgs.xorg.libXtst
      pkgs.xorg.libXi
      pkgs.xorg.libXrandr
      pkgs.freetype
      pkgs.fontconfig
      pkgs.cairo
      pkgs.pango
      pkgs.gdk-pixbuf
      pkgs.atk
      pkgs.gtk3
    ];
    PYTHONHOME = "${pkgs.python3}";
    PYTHONPATH = "${pkgs.python3}/lib/python3.11/site-packages";
    NODE_PATH = "${pkgs.nodePackages.pnpm}/lib/node_modules";
    NPM_CONFIG_PREFIX = "/home/runner/.npm-global";
  };
}
