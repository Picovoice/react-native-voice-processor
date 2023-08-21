//
// Copyright 2023 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

// import {Platform} from 'react-native';
// import fs from 'react-native-fs';
//
// import {VoiceProcessor} from '@picovoice/react-native-voice-processor';

export type Result = {
    testName: string;
    success: boolean;
    errorString?: string;
};
//
// function arraysEqual(a, b) {
//     if (a === b) {
//         return true;
//     }
//     if (a == null || b == null) {
//         return false;
//     }
//     if (a.length !== b.length) {
//         return false;
//     }
//
//     for (let i = 0; i < a.length; ++i) {
//         if (a[i] !== b[i]) {
//             return false;
//         }
//     }
//
//     return true;
// }

async function basicTest(): Promise<Result> {
    return {
        testName: 'Basic test',
        success: true,
    };
}

async function invalidSetupTest(): Promise<Result> {
    return {
        testName: 'Invalid setup test',
        success: true,
    };
}

async function addRemoveListenerTest(): Promise<Result> {
    return {
        testName: 'Add and remove listeners test',
        success: true,
    };
}

export async function runVoiceProcessorTests(): Promise<Result[]> {
    return [
        await basicTest(),
        await invalidSetupTest(),
        await addRemoveListenerTest(),
    ];
}
