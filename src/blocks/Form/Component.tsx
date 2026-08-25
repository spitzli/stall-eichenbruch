'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  form: FormType
  heading?: string | null
  intro?: string | null
}

export const FormBlock: React.FC<{ id?: string } & FormBlockType> = (props) => {
  const {
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    heading,
    intro,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = await req.json()

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Senden fehlgeschlagen.',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect?.url) {
            router.push(redirect.url)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: 'Senden fehlgeschlagen. Bitte versuche es später noch einmal.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  return (
    <div className="grid gap-8 md:grid-cols-12">
      <div className="md:col-span-5">
        {heading && <h2 className="text-3xl md:text-4xl">{heading}</h2>}
        {intro && (
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
            {intro}
          </p>
        )}
      </div>
      <div className="md:col-span-7 plate">
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && (
            <RichText data={confirmationMessage} enableGutter={false} />
          )}
          {isLoading && !hasSubmitted && <p>Wird gesendet …</p>}
          {error && (
            <p className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-destructive" role="alert">
              {error.message}
            </p>
          )}
          {!hasSubmitted && (
            <form id={formID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              {formFromProps?.fields?.map((field, index) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                if (!Field) return null
                return (
                  <Field
                    key={index}
                    form={formFromProps}
                    {...field}
                    {...formMethods}
                    control={control}
                    errors={errors}
                    register={register}
                  />
                )
              })}

              <div className="pt-2">
                <Button form={formID} type="submit" size="lg">
                  {submitButtonLabel || 'Absenden'}
                </Button>
              </div>
            </form>
          )}
        </FormProvider>
      </div>
    </div>
  )
}
