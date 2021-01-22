import { PortScanner } from "./port-scanner";



const portScanner = new PortScanner("data.txt", process.argv.findIndex((arg: string) => arg === "--json") >= 0 );

portScanner.start();