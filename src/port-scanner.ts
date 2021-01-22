import { FileDataProvider } from "./data-providers/file-data-provider";
import { JsonConsoleReporter } from "./reporting/reporters/json-console-reporter";
import { Scanner } from "./scanner";

export class PortScanner {

constructor(private hostsFilePath: string, private jsonOutput: boolean) {

}

public async start(): Promise<void> {

    const hosts = this.getAddresses(this.hostsFilePath);

    const scanner = new Scanner();

     const report = await scanner.scanAllHosts(hosts);

     if (this.jsonOutput) {
     const jsonReporter = new JsonConsoleReporter();

     jsonReporter.report(report);
     }
}

private  getAddresses(path: string): Map<string, Array<number>> {

    const fileDataProvider = new FileDataProvider(path);
    
    const hostToPorts = new Map<string, Array<number>>();

    let currentLine = fileDataProvider.provideLine();

    while (!fileDataProvider.end) {

        const lineData =  currentLine.split(' ');

        const hostname = lineData[0];
        const port = lineData[1];

        if(hostToPorts.has(hostname)) {
            hostToPorts.get(hostname).push(Number(port))
        } else {
            hostToPorts.set(hostname, [Number(port)]);
        }

        currentLine = fileDataProvider.provideLine();
    }

    return hostToPorts;

    }
}

