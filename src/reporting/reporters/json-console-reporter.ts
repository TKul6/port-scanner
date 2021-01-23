import { HostReport } from "../host-report";
import { Reporter } from "./reporter";
export class JsonConsoleReporter implements Reporter {
    public report(reports: HostReport[]) {
        console.log(JSON.stringify(reports, null, 2))
    };

}