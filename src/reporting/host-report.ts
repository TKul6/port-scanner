import { PortReport } from "./port-report";

export class HostReport {

    public dnsLookupExecutionTime: number;
    ip: string;
    dnsLookupSucceed: boolean;
    portReports = new Array<PortReport>();

    constructor(public host: string) {

    }
}

