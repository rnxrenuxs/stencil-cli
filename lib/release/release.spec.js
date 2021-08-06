const inquirerModule = require('inquirer');

const StencilRelease = require('./release');
const StencilBundle = require('../stencil-bundle');

afterAll(() => jest.restoreAllMocks());

describe('Release unit tests', () => {
    const accessToken = 'accessToken_value';
    const normalStoreUrl = 'https://www.example.com';
    const stencilConfig = {
        accessToken,
        normalStoreUrl,
    };
    const remoteUrl = 'https://github.com/bigcommerce/cornerstone';
    const githubToken = 'githubToken_value';
    const gitStatus = {
        not_added: [],
        conflicted: [],
        created: [],
        deleted: [],
        modified: [],
        renamed: [],
        current: 'master',
        behind: 0,
        ahead: 0,
    };
    const remotes = [{ refs: { push: remoteUrl }, name: 'cornerstone' }];
    const commit = {
        commit: '12345789',
    };
    const currentThemeVersion = '1.0.0';
    const newThemeVersion = '1.0.1';
    const fileData = {
        version: newThemeVersion,
    };
    const changelog = `
    # Changelog
    All notable changes to this project will be documented in this file.


    ## Draft

    ## 1.0.0 (08-06-2021)
    - Released 1.0.0
    `;
    const rawConfig = {
        meta: {
            author_name: 'Emilio Esteves',
            author_email: 'Emilio@work.net',
            author_support_url: 'http://emilio.net',
        },
    };
    const bundlePath = 'somePath';
    const themeName = 'cornerstone';
    const uploadReleaseAssetData = {
        data: {
            browser_download_url: 'bundle_download_url',
        },
    };
    const releaseData = {
        data: {
            id: 'release_id',
            html_url: 'release_url',
        },
    };

    const getFsUtilsStub = () => ({
        existsSync: jest.fn(),
        parseJsonFile: jest.fn().mockResolvedValue(fileData),
        recursiveReadDir: jest.fn(),
    });
    const answers = {
        version: newThemeVersion,
        remote: remoteUrl,
        createGithubRelease: true,
        githubToken,
        proceed: true,
    };
    const getCliCommonStub = () => ({
        checkNodeVersion: jest.fn(),
    });
    const getThemeConfigManagerStub = () => ({
        getVersion: jest.fn().mockResolvedValue(currentThemeVersion),
        getRawConfig: jest.fn().mockResolvedValue(rawConfig),
        configExists: jest.fn().mockReturnValue(true),
        schemaExists: jest.fn().mockReturnValue(false),
        getName: jest.fn().mockResolvedValue(themeName),
    });
    const getStencilConfigManagerStub = () => ({
        read: jest.fn().mockResolvedValue(stencilConfig),
        save: jest.fn(),
    });

    const getGitStub = () => ({
        status: jest.fn().mockResolvedValue(gitStatus),
        getRemotes: jest.fn().mockResolvedValue(remotes),
        add: jest.fn(),
        commit: jest.fn().mockResolvedValue(commit),
        push: jest.fn(),
    });
    const getFsModuleStub = () => ({
        promises: {
            unlink: jest.fn(),
            readFile: jest.fn().mockReturnValueOnce(changelog),
            writeFile: jest.fn(),
        },
    });

    const getLoggerStub = () => ({
        log: jest.fn(),
        error: jest.fn(),
        warning: jest.fn(),
    });

    const getOctokitStub = () => ({
        Octokit: jest.fn().mockImplementation(() => ({
            repos: {
                uploadReleaseAsset: jest.fn().mockResolvedValue(uploadReleaseAssetData),
                createRelease: jest.fn().mockResolvedValue(releaseData),
            },
        })),
    });

    jest.spyOn(inquirerModule, 'prompt').mockReturnValue(answers);
    jest.spyOn(StencilBundle.prototype, 'initBundle').mockReturnValue(bundlePath);

    const createStencilReleaseInstance = ({
        git,
        themeConfigManager,
        stencilConfigManager,
        fsModule,
        fsUtils,
        cliCommon,
        logger,
        ocktokitModule,
    } = {}) => {
        const passedArgs = {
            git: git || getGitStub(),
            themeConfigManager: themeConfigManager || getThemeConfigManagerStub(),
            stencilConfigManager: stencilConfigManager || getStencilConfigManagerStub(),
            fs: fsModule || getFsModuleStub(),
            fsUtils: fsUtils || getFsUtilsStub(),
            cliCommon: cliCommon || getCliCommonStub(),
            logger: logger || getLoggerStub(),
            octokit: ocktokitModule || getOctokitStub(),
        };
        const instance = new StencilRelease(passedArgs);

        return {
            passedArgs,
            instance,
        };
    };

    describe('constructor', () => {
        it('should create an instance of StencilRelease without options parameters passed', async () => {
            const instance = new StencilRelease();

            expect(instance).toBeInstanceOf(StencilRelease);
        });

        it('should create an instance of StencilRelease with all options parameters passed', async () => {
            const { instance } = createStencilReleaseInstance();

            expect(instance).toBeInstanceOf(StencilRelease);
        });
    });

    describe('run', () => {
        it('should run stencil release successfully', async () => {
            const { instance } = createStencilReleaseInstance();

            const result = await instance.run();

            expect(result).toBe(true);
        });
    });
});
