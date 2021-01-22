import * as dns from 'dns';
import { Socket } from 'net'
import { PortReport } from './reporting/port-report';
import { HostReport } from './reporting/report';

const NANO_SECOND_IN_MILLI_SECOND = 1000000;
const DNS_LOOKUP_TIMEOUT_IN_MILLI_SECONDS = 4000;
const SOCKET_CONNECT_TIMEOUT_IN_MILLI = 2000;

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
            const executionTimeInMS = process.hrtime(startMeasure)[1] / NANO_SECOND_IN_MILLI_SECOND;
            report.ip = ip;
            report.dnsLookupExecutionTime = executionTimeInMS;
            report.dnsLookupSucceed = true;

        } catch {
            console.error('Failed to resolve host ', host);
            report.dnsLookupSucceed = false;
        }

        for (let port of ports) {
            promises.push(this.scanAddress(host, port));
        }
        const portReports = await Promise.all(promises); // TODO: change to whenSetteled.

        report.portReports = portReports;

        return report;
    }

    public async scanAddress(ip: string, port: number): Promise<PortReport> {

        return new Promise<PortReport>((resolve, rejects) => {

            const client = new Socket();

            client.setTimeout(SOCKET_CONNECT_TIMEOUT_IN_MILLI, () => {
                client.destroy();
                resolve(new PortReport(port, 'timeout'));
            })

            // Todo: see if can be converted to promise???
            client.on('error', (err) => {
                client.end();
                resolve(new PortReport(port,'used'))
            });

            client.connect(port, ip, () => {
                client.end();
                resolve(new PortReport(port, 'free'));
            });

        });

    }

    private async convertToIp(host: string): Promise<string> {

        // TODO add timeout

        // TODO Support IPV6

        return new Promise<string>((resolve, reject) => {
            dns.lookup(host, {}, ((err: Error, address: string, family: number) => {

                if (err) {
                    // TODO: log
                    reject(err);
                }
                resolve(address)
            }));

        });


    }

}



