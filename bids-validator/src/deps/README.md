Deno convention is to place dependencies in an module like this to keep them easy to update. Each dependency should be its own file to prevent compilation of unused dependencies if they are outside of the tree for a given entrypoint.

See ["Manage Dependencies"](https://deno.land/manual@main/examples/manage_dependencies) in the Deno manual.
