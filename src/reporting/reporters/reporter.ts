import { HostReport } from "../report";

export interface Reporter {

    report: (reports: Array<HostReport>) => void;
}