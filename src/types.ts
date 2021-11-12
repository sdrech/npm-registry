/**
 * The result of a package request against `https://registry.npmjs.org`. This is
 * a subset of the returned data, not a full representation, that contains
 * everything you will need to carry out the exercise.
 *
 * @example
 * {
 *   "name": "react",
 *   "description": "React is a JavaScript library for building user interfaces.",
 *   "dist-tags": {
 *     "latest": "16.13.0"
 *   },
 *   "versions": {
 *     "16.13.0": {
 *       "name": "react",
 *       description: "React is a javascript module to make it easier to work with asynchronous code",
 *       "version": "16.13.0",
 *       "dependencies": {
 *         "loose-envify": "^1.1.0",
 *         "object-assign": "^4.1.1",
 *         "prop-types": "^15.6.2",
 *       }
 *     }
 *   }
 * }
 */

export type PackageBasicInfo = {
  name: string;
  description: string;
  version: string;
  dependencies?: {
    [packageName: string]: string;
  };
};

export type NPMPackage = Omit<PackageBasicInfo, 'version'> & {
  'dist-tags': {
    [tag: string]: string;
  };
  versions: {
    [version: string]: PackageBasicInfo;
  };
};

export interface NPMPackageRecursion {
  name: string;
  version: string;
  dependencies?: NPMPackageRecursion[];
}

export interface ErrorResponse {
  errorMessage: string;
}

export enum DataFormat {
  JSON = 'JSON',
  HTML = 'HTML',
}
