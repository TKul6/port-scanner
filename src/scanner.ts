import * as dns from 'dns';
import { Socket } from 'net'
import { PortAvailabilityResultType, PortReport } from './reporting/port-report';
import { HostReport } from './reporting/report'
import * as ipParser from 'ip6addr';
import { PromiseSocket, TimeoutError } from 'promise-socket';
import { HostInformation } from './host-information';

const NANO_SECOND_IN_MS = 1000000;
const DNS_LOOKUP_TIMEOUT_IN_MS = 4000;
const SOCKET_CONNECT_TIMEOUT_IN_MS = 2000;

export class Scanner {

    constructor() { }

    public async scanAllHosts(hosts: Array<HostInformation>): Promise<Array<HostReport>> {

        const reports = new Array<HostReport>();


        for (let hostInformation of hosts) {
            const report = await this.scanSingleHost(hostInformation);
            reports.push(report);
        }

        return reports;
    }

    public async scanSingleHost(hostInformation: HostInformation): Promise<HostReport> {

        const report = new HostReport(hostInformation.host);
        const promises = new Array<Promise<PortReport>>();

        try {
            const startMeasure = process.hrtime();
            const ip = await this.convertToIp(hostInformation.host);
            const executionTimeInMS = process.hrtime(startMeasure)[1] / NANO_SECOND_IN_MS;
            report.ip = ipParser.parse(ip).toString();;
            report.dnsLookupExecutionTime = executionTimeInMS;
            report.dnsLookupSucceed = true;

        } catch {
            console.error('Failed to resolve host ', hostInformation.host);
            report.dnsLookupSucceed = false;
            return report;
        }

        for (let port of hostInformation.ports) {
            promises.push(this.scanAddress(hostInformation.host, port));
        }
        const resolvedPromises = await Promise.allSettled(promises);

        // Currently promises cannot be rejected, but just in case the implementation will change.
        report.portReports = resolvedPromises
            .filter((result: PromiseSettledResult<PortReport>) => result.status === 'fulfilled')
            .map((result: PromiseFulfilledResult<PortReport>) => result.value);

        return report;
    }

    public async scanAddress(ip: string, port: number): Promise<PortReport> {

        const client = new PromiseSocket();

        client.setTimeout(SOCKET_CONNECT_TIMEOUT_IN_MS);

        let portAvailability: PortAvailabilityResultType;
        try {
            await client.connect(port, ip);
            portAvailability = 'free'
        } catch (error) {
            if (error instanceof TimeoutError) {
                portAvailability = 'timeout';
            } else {
                portAvailability = 'used'
            }
        }

        return new PortReport(port, portAvailability);
    }

    private convertToIp(host: string): Promise<string> {


        return new Promise<string>(async (resolve, reject) => {

            const timeoutHandler = setTimeout(() => reject('timeout'), DNS_LOOKUP_TIMEOUT_IN_MS);

            try {
                const data = await dns.promises.lookup(host, { all: true });
                resolve(data[data.length - 1].address);

            } catch {
                reject();
            }

            finally {
                clearTimeout(timeoutHandler);
            }

        })


    }


}



