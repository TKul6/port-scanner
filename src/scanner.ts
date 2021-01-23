import * as dns from 'dns';
import { Socket } from 'net'
import { PortAvailabilityResultType, PortReport } from './reporting/port-report';
import { HostReport } from './reporting/report'
import * as ipParser from 'ip6addr';
import { PromiseSocket, TimeoutError } from 'promise-socket';

const NANO_SECOND_IN_MS = 1000000;
const DNS_LOOKUP_TIMEOUT_IN_MS = 4000;
const SOCKET_CONNECT_TIMEOUT_IN_MS = 2000;

export class Scanner {

    constructor() { }

    public async scanAllHosts(hosts: Map<string, Array<number>>): Promise<Array<HostReport>> {

        const reports = new Array<HostReport>();


        for (let host of hosts.keys()) {
            const ports = hosts.get(host);
            const report = await this.scanSingleHost(host, ports);
            reports.push(report);
        }

        return reports;
    }

    public async scanSingleHost(host: string, ports: Array<number>): Promise<HostReport> {

        const report = new HostReport(host);
        const promises = new Array<Promise<PortReport>>();

        try {
            const startMeasure = process.hrtime();
            const ip = await this.convertToIp(host);
            const executionTimeInMS = process.hrtime(startMeasure)[1] / NANO_SECOND_IN_MS;
            report.ip = ipParser.parse(ip).toString();;
            report.dnsLookupExecutionTime = executionTimeInMS;
            report.dnsLookupSucceed = true;

        } catch {
            console.error('Failed to resolve host ', host);
            report.dnsLookupSucceed = false;
            return report;
        }

        for (let port of ports) {
            promises.push(this.scanAddress(host, port));
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



