import {RequestHandler} from 'express';
import got from 'got';
import {DataFormat, NPMPackage, NPMPackageRecursion, PackageBasicInfo} from './types';
import {Template} from './template';

/**
 * Attempts to get package data and display it (in JSON or HTML format)
 *
 * @SuccessfulResponse({status: 200, type: AdminPrizeShippingMethodsDto})
 * ToDo: implement Swagger or real Decorators in the live project in order to keep better documentation
 */
export const getPackage: RequestHandler = async function (req, res, next) {
  const { name, version } = req.params;
  // it's a good practice to implement the validation of request-params here

  let desiredDataFormat = DataFormat.JSON;
  if (req.headers?.accept && req.headers.accept.indexOf('text/html') >= 0) {
    // if request is coming from the client/browser which is expecting HTML
    desiredDataFormat = DataFormat.HTML;
  }

  try {
    const data = await retrieveRemotePackageInfo({ name, version });
    if (!data) {
      throw new Error('Wrong package name or its version');
    }

    if (desiredDataFormat === DataFormat.HTML) {
      return res.status(200).send(Template.getPage(data));
    }
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};


/**
 * Retrieve data of package's SPECIFIC version from the npm registry and return it
 */
const retrieveRemotePackageInfo = async function ({name, version}: NPMPackageRecursion): Promise<NPMPackageRecursion | undefined> {
  try {
    const packageSpecificVer: PackageBasicInfo = await got(
      `https://registry.npmjs.org/${name}/${version}`,
    ).json();
    const remoteDependencies = packageSpecificVer.dependencies || {};
    let dependencies: NPMPackageRecursion[] = [];

    if (!Object.keys(remoteDependencies).length) {
      // No dependencies for the package
      return { name, version, dependencies};
    }

    for (const item of Object.keys(remoteDependencies)) {
      // taking into account some version could be listed with leading symbols like '~', '^' or '>0' we need to detect them
      const positionOfDigitInVersion = remoteDependencies[item].search(/\d/);
      const dependencyItem: NPMPackageRecursion = {
        name: item,
        version: remoteDependencies[item].substring(positionOfDigitInVersion)   // ignore first NON-digit symbols
      };
      dependencies.push(dependencyItem);
    }

    if (dependencies) {
      const possibleSubDependencies = await Promise.all(
        dependencies.map(dependency => retrieveRemotePackageInfo(dependency))
      );
      dependencies = dependencies.map((dependency, i) => {
        return {
          ...dependency,
          dependencies: possibleSubDependencies[i]?.dependencies || []
        };
      });
    }

    return { name, version, dependencies};

  } catch (error) {
    return undefined;
  }
};

/**
 * Retrieve data of ALL package's versions from the npm registry and return it
 * (Currently is not using)
 */
const retrieveRemotePackageAllVersionsInfo = async function ({name, version}: NPMPackageRecursion): Promise<PackageBasicInfo | undefined> {
  try {
    const npmPackage: NPMPackage = await got(
      `https://registry.npmjs.org/${name}`,
    ).json();
    const dependencies = npmPackage.versions[version].dependencies;

    return { name, version, dependencies, description: npmPackage.description};
  } catch (error) {
    return undefined;
  }
};

