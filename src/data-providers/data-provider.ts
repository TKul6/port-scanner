export interface DataProvider {

    provideLine: () => string;

    end: boolean;

    dispose: () => void;
}