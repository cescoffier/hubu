Ideas
=====

Pub/Sub
-------

The pub/sub mechanism should be improved:

* the reception should be handled as a binding.

Service-orientation
-------------------

To avoid declaring the binding explicitely, the binding concepts should be improved:

* components register services:

    hub.registerService(contract, service object)

* components require services:

    hub.lookup(contract) -> service object[]
    hub.lookup(contract, receiver, injector)

* consistency check: if a component uses a service injected using the second method, the hub reports
an error/warning if an injected service is not here.

* service selection:
services should be selected according to a 'context' object including the current session, the browser object.

