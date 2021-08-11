import React from 'react';
import { Translate } from 'react-localize-redux';
import { Grid } from 'semantic-ui-react';
import styled from 'styled-components';

const DisclaimerGrid = styled(Grid)`
    && .disclaimer {
        margin-top: 100px;
        border-top: 2px solid #f8f8f8;

        > .column {
            padding-left: 0px;
            padding-right: 0px;
        }
    }
    .disclaimer-info {
        font-weight: 500;
    }

    @media screen and (max-width: 767px) {
        && .disclaimer {
            margin-top: 50px;
            font-size: 12px;
            margin-left: 1rem;
            margin-right: 1rem;
        }
    }
`;

const Disclaimer = () => (
    <DisclaimerGrid>
        <Grid.Row className='disclaimer'>
            <Grid.Column computer={16} tablet={16} mobile={16}>
                <span className='disclaimer-info'><Translate id='disclaimer.title' />: </span>
                <Translate id='disclaimer.text' /> <a href='http://nearprotocol.com'>nearprotocol.com</a>
            </Grid.Column>
        </Grid.Row>
    </DisclaimerGrid>
);

export default Disclaimer;
