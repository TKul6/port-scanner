import { FileDataProvider } from "./data-providers/file-data-provider";
import { Scanner } from "./scanner";

function getAddresses(path: string): Map<string, Array<number>> {

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




 async function  main() {

const hosts = getAddresses("data.txt");

    const scanner = new Scanner();

     const report = await scanner.scanAllHosts(hosts);

     console.log(report);
        }

main();
