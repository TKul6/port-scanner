import { PortScanner } from "./port-scanner";
import { FileDataProvider } from "./data-providers/file-data-provider";
import { Reporter } from "./reporting/reporters/reporter";
import { JsonConsoleReporter } from "./reporting/reporters/json-console-reporter";


const fileDataProvider = new FileDataProvider('data.txt');

const reporter = getReporter();

const portScanner = new PortScanner(fileDataProvider, reporter);

 portScanner.start();

 function getReporter(): Reporter {
 if(process.argv.findIndex((arg: string) => arg === '--json') >= 0) {
     return new JsonConsoleReporter();
 }
 }