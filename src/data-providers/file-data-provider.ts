import LineByLine = require("n-readlines");
import { DataProvider } from "./data-provider";
const  lineByLine =  require('n-readlines');

export class FileDataProvider implements DataProvider {

private fileReader: LineByLine = null;

public end: boolean;

constructor(private fileName: string) {
    this.end = false;
}

    public provideLine(): string {

        if(!this.fileReader) {
            this.initialize();
        }

        const line = this.fileReader.next();

        this.end = line === false;

        return line.toString('ascii').trim();

    }
    
    public dispose() {
        this.fileReader.close();
    }

    private initialize() {
        this.fileReader = new LineByLine(this.fileName);
    }

}