import * as getPort from 'get-port';
import got from 'got';
import { Server } from 'http';
import { createApp } from '../src/app';

describe('/package/:name/:version endpoint', () => {
  let server: Server;
  let port: number;
  let urlCommon: string;
  let url: string;
  let packageName = 'react';
  let packageVersion = '16.13.0';

  beforeAll(async (done) => {
    port = await getPort();
    server = createApp().listen(port, done);
    urlCommon = `http://localhost:${port}/package`;
    url = `${urlCommon}/${packageName}/${packageVersion}`;
  });

  afterAll((done) => {
    server.close(done);
  });

  it('successful response', async () => {
    const res: any = await got(url).json();

    expect(res.name).toEqual(packageName);
    expect(res.version).toEqual(packageVersion);
  });

  it('simple package\'s  dependencies', async () => {
    const res: any = await got(url).json();

    expect(res.dependencies.length).toEqual(3);

    expect(res.dependencies[0].name).toEqual('loose-envify');
    expect(res.dependencies[0].version).toEqual('1.1.0');
    expect(res.dependencies[0].dependencies.length).toEqual(1);

    expect(res.dependencies[1].name).toEqual('object-assign');
    expect(res.dependencies[1].version).toEqual('4.1.1');
    expect(res.dependencies[1].dependencies.length).toEqual(0);

    expect(res.dependencies[2].name).toEqual('prop-types');
    expect(res.dependencies[2].version).toEqual('15.6.2');
    expect(res.dependencies[2].dependencies.length).toEqual(2);
  });

  it('complex package\'s dependencies', async () => {
    const packageName = 'firebase';
    const packageVersion = '4.9.0';
    const res: any = await got(`${urlCommon}/${packageName}/${packageVersion}`).json();

    expect(res.dependencies.length).toEqual(9);
    expect(res.dependencies[2].dependencies[2].dependencies[0].dependencies.length).toEqual(1);
  });

});
