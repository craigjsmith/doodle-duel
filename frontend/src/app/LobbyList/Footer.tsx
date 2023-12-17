'use client'

import styles from './footer.module.css'

import { Flex, Text, Stack } from '@mantine/core';

export default function Footer() {
    return (
        <div className={styles.footer}>
            <Text size={'lg'}>
                Created by <a className={styles.portfolioLink} href='https://craigsmith.dev' target='_blank'>Craig Smith</a>
            </Text>

            <Flex direction='row' align='center'>
                <img src='/images/github.svg' height={20} width={20} />

                <Text size={'lg'} ml={6}>
                    <a className={styles.link} href='https://github.com/craigjsmith/doodle-duel' target='_blank'>
                        Source code
                    </a>
                </Text>
            </Flex>
        </div>
    )
}
