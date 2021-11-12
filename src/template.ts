import {NPMPackageRecursion} from "./types";

export class Template {
	static getPage(npmPackageData: NPMPackageRecursion) {
		return `
			<!DOCTYPE html>
			<html lang="en">
			<title>NPM package dependecies</title>
			<body style="font-family:Verdana, Arial; line-height:2; font-size:12px">
			${this.getItemContent(npmPackageData)}
			</body>
			</html>
		`;
	}

	static getItemContent({ name, version, dependencies}: NPMPackageRecursion, deep = 1) {
		let content = `
			<div style='margin-left: ${deep * 10}px'>
			<strong>Package:</strong> ${name} (${version}).
		`;

		if (dependencies && dependencies.length) {
			content += `Dependencies:`;
			dependencies.forEach(dependency => content += this.getItemContent(dependency, deep + 1));
		}

		content += `</div>`;
		return content;
	}
}
