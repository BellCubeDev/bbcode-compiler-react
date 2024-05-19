import { DoNotRenderBBCodeError } from "@/advanced.js";
import { doNotRenderBBCodeComponent } from "@/generator/utils/doNotRenderBBCodeComponent.js";
import type { Transform } from "@/index.js"
import React from "react";

export const throwErrorTestTransforms: ReadonlyArray<Transform> = [
    {
        name: 'throw_normal',
        Component() {
            throw new Error('This is an error for the test! hehe')
        },
    },
    {
        name: 'throw_manually',
        Component() {
            throw new DoNotRenderBBCodeError()
        },
    },
    {
        name: 'throw_with_util',
        Component() {
            doNotRenderBBCodeComponent()
        },
    },
    {
        name: 'do_nothing',
        Component({ children }) {
            return <span data-did-render-component="obviously">{children}</span>
        },
    }
]
