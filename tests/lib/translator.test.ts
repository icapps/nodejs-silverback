import { importTranslations } from '../../src/lib/translator';
import { existsSync, rmdirSync, mkdirSync } from 'fs';
import * as icappsTranslation from 'tree-house-translations';
import * as rimraf from 'rimraf';

describe('importTranslations', () => {
  let icappsTranslationMock;
  const newDestination = './tests/locales';

  beforeEach(() => {
    icappsTranslationMock = jest.spyOn(icappsTranslation, 'import').mockImplementation(() => { });
  });

  afterEach((done) => {
    jest.clearAllMocks();
    rimraf(newDestination, done); // cleanup
  });

  it('should import the translations', async () => {
    await importTranslations('http://test.be', 'randomToken', { destination: newDestination });
    expect(icappsTranslationMock).toHaveBeenCalledTimes(1);
  });

  it('should use the existing locales directory', async () => {
    mkdirSync(newDestination);
    expect(existsSync(newDestination)).toEqual(true);

    await importTranslations('http://test.be', 'randomToken', { destination: newDestination });
    expect(icappsTranslationMock).toHaveBeenCalledTimes(1);
  });

  it('should create the locales directory if not exists', async () => {
    const newDestination = './tests/locales';

    await importTranslations('http://test.be', 'randomToken', { destination: newDestination });
    expect(icappsTranslationMock).toHaveBeenCalledTimes(1);
    expect(existsSync(newDestination)).toEqual(true);
  });
});
