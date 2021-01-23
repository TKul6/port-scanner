import { HostInformation } from "../host-information";
import { DataProvider } from "./data-provider";
import * as promisesFs from 'fs/promises'

export class FileDataProvider implements DataProvider {

constructor(private fileName: string) {
}
    public async provideHostsInformation(): Promise<Array<HostInformation>> {

        const hostToInformation = new Map<string, HostInformation>();
        const fileContent =  await promisesFs.readFile(this.fileName,{encoding: 'ascii'});
        fileContent
        .split('\r\n')
        .forEach((line: string) => {
            const lineData =  line.split(' ');

            const host = lineData[0];
            const port = Number(lineData[1]);

            if(hostToInformation.has(host)) {
                hostToInformation.get(host).ports.push(port);
            } else {
                hostToInformation.set(host, new HostInformation(host, [port]))
            }
        });

        return Array.from(hostToInformation.values());
    }

}