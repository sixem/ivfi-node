/** Vendors */
import chalk from 'chalk';

import {
    debug
} from './logger';

import {
    mergeMetadata,
    wildcardExpression
} from './index';

import {
    TDotFile,
    TFileContent,
    TMetaData
} from '../../types';

const ignoreFiles = (data: {
    files: Array<TFileContent>,
    directories: Array<TFileContent>
}, itemFilter: Array<string>, excludeExtensions: Array<string> = null) =>
{
    /** Store file objects and keys */
    const fileObject = {};

    /** Get all files and directories */
    for(const file of data.files)
    {
        fileObject[file.name] = file
    }

    for(const dir of data.directories)
    {
        fileObject[dir.name + '/'] = dir
    }

    /** Get file keys */
    const fileKeys = Object.keys(fileObject);

    /** Store lengths */
    const fileKeysLength = fileKeys.length;
    const filterLength = itemFilter.length;

    for(let i = 0; i < filterLength; i++)
    {
        const ignoreItem = itemFilter[i] as string;

        if(!ignoreItem) continue;

        if(Object.prototype.hasOwnProperty.call(fileObject, ignoreItem))
        {
            fileObject[ignoreItem].hidden = true;
        } else if(ignoreItem.includes('*'))
        {
            /** Escape input and create new regular expression */
            const ignoreRegex = wildcardExpression(ignoreItem);

            for(let i = 0; i < fileKeysLength; i++)
            {
                const key = fileKeys[i];

                if(ignoreRegex.test(key))
                {
                    fileObject[key].hidden = true;
                }
            }
        }
    }

    if(excludeExtensions.length > 0)
    {
        for(const file of data.files)
        {
            if(excludeExtensions.includes(file.extension))
            {
                file.hidden = true;
            }
        }
    }
};

export const handleDotFile = (config: TDotFile, data: {
    files: Array<TFileContent>,
    directories: Array<TFileContent>,
    metadata: TMetaData,
    setMetadata: (data: TMetaData) => void
}) =>
{
    const { metadata, setMetadata, files, directories } = data;

    /**	Handle ignored or excluded (file extensions) files */
    if((config.ignore
        && Array.isArray(config.ignore)
        && config.ignore.length > 0)
        || (config.exclude
            && Array.isArray(config.exclude)
            && config.exclude.length > 0))
    {
        const itemFilter = config.ignore && Array.isArray(config.ignore)
            ? config.ignore
            : [];

        const excludeExtensions = config.exclude && Array.isArray(config.exclude)
            ? (config.exclude).map((item) => (item as string).toLowerCase())
            : [];

        ignoreFiles(
            { files, directories },
            itemFilter as Array<string>,
            excludeExtensions as Array<string>
        );
    }

    /** Handle metadata */
    if(config.metadata)
    {
        /** Get behavior */
        const behavior = (config.metadataBehavior as string)?.toLowerCase() || 'overwrite';

        if(behavior === 'overwrite')
        {
            /** Set new metadata by merging */
            setMetadata(
                mergeMetadata(
                    metadata as TMetaData, config.metadata as TMetaData
                )
            );
        } else if(behavior === 'replace')
        {
            /** Set new metadata by replacement */
            setMetadata(
                config.metadata as TMetaData
            );
        } else {
            debug(chalk.red(
                `Invalid ${chalk.yellow('metadataBehavior')} ('${chalk.yellow(behavior)}') - ignoring.`
            ));
        }
    }
};