import { DataProvider } from "./data-providers/data-provider";
import { Reporter } from "./reporting/reporters/reporter";
import { Scanner } from "./scanner";

export class PortScanner {

    constructor(private dataProvider: DataProvider, private reporter?: Reporter) {
    }

    public async start(): Promise<void> {

        const hosts = await this.dataProvider.provideHostsInformation();

        const scanner = new Scanner();

        const report = await scanner.scanAllHosts(hosts);

        if (this.reporter) {

            this.reporter.report(report);
        }
    }

}

