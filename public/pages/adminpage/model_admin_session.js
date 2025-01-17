import rxjs from "../../lib/rx.js";
import ajax from "../../lib/ajax.js";

window.ajax = ajax;

class AdminSessionManager {
    constructor() {
        this.subject = new rxjs.Subject();
    }

    isAdmin() {
        return rxjs.merge(
            this.subject,
            rxjs.interval(30000).pipe(
                rxjs.startWith(null),
                rxjs.mergeMap(() => ajax({ url: "/admin/api/session", responseType: "json" })),
                rxjs.map(({ responseJSON }) => responseJSON.result),
                rxjs.distinctUntilChanged(),
            ),
        );
    }

    login() {
        return rxjs.pipe(
            rxjs.mergeMap((body) => ajax({
                url: "/admin/api/session",
                method: "POST", body, responseType: "json",
            }).pipe(
                rxjs.mapTo(true),
                rxjs.catchError(() => rxjs.of(false)),
                rxjs.tap((ok) => ok && this.subject.next(ok))
            )),
        );
    }
}

export default new AdminSessionManager();
