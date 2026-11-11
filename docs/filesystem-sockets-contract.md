# Transcript and socket filesystem contract (r5)

Source, dependencies, build/cache, fixture data, logs and evidence stay on verified Store.
Only Unix sockets and their private 0700 directory use host-local /tmp. Socket names are
bounded to 103 bytes; NFS is rejected at the host API. Default host log remains under
the configured home, not the socket directory. Existing non-sockets, foreign-owned,
symlink or permissive socket directories are rejected. Tests join clients and host
before bounded retry removal of their owned directories (including .nfs/EBUSY cases).
No production host is launched by this repair.

Transcript freshness never uses birthtime or wall-clock age. Unseen path/device/inode
starts at zero; consumed offsets are tracked with size and mtime. Resume of a recorded
unchanged identity continues at its recorded offset, including appended bytes. Truncate,
replacement and same-size rewrite invalidate the offset, partial line and stale context.
These records are process-local; an unknown historical transcript after restart is replayed
from zero rather than silently skipped. Durable identity persistence is not added here.
Same-inode rewrite-and-regrow between polls can be indistinguishable from append; it is
not claimed detectable. No real browser, full suite, package smoke or install acceptance.
