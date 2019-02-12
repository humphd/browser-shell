# browser-shell

A [Linux shell](https://github.com/humphd/browser-vm) in the browser via
[forked x86.js](https://github.com/humphd/v86/tree/filer-9p-lastknowngood),
with bi-directional POSIX filesystem (via [Filer](https://github.com/filerjs/filer))
shared over [Plan 9 resource sharing](https://www.kernel.org/doc/Documentation/filesystems/9p.txt).

The Filer filesystem in the browser is mounted in the Linux VM at `/mnt`.

## Example

Until I get a demo uploaded for people to try themselves, here's a sample of what
it does:

![](screenshots/browser-shell.gif)
