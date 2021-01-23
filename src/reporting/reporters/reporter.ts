import { HostReport } from "../host-report";

export interface Reporter {

    report: (reports: Array<HostReport>) => void;
}