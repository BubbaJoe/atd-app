import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  VStack,
} from '@chakra-ui/react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAttendanceByDateQuery } from '../hooks/useAttendanceByDate'
import { useCallback, useMemo } from 'react'
import { dayjs } from '../lib/dayjs'

const updateAttendanceSchema = z.object({
  starts: z.string().array(),
  ends: z.string().array(),
  rest_starts: z.string().array(),
  rest_ends: z.string().array(),
})
type UpdateAttendanceSchema = z.infer<typeof updateAttendanceSchema>

type Props = {
  attendanceDate: string
  onClose: () => void
}
export const UpdateAttendanceModal = ({ attendanceDate, onClose }: Props) => {
  const { data, fetching } = useAttendanceByDateQuery(attendanceDate)

  const defaulatValues: UpdateAttendanceSchema = useMemo(() => {
    if (!data)
      return {
        starts: [],
        ends: [],
        rest_starts: [],
        rest_ends: [],
      }
    // Todo: HH:mm形式に変換
    return {
      starts: data.attendance?.map((data) =>
        dayjs.tz(data?.start_time).format('HH:mm')
      ),
      ends: data.attendance?.map((data) =>
        dayjs.tz(data?.end_time).format('HH:mm')
      ),
      rest_starts: data.rest?.map((data) =>
        dayjs.tz(data?.start_rest).format('HH:mm')
      ),
      rest_ends: data.rest?.map((data) =>
        dayjs.tz(data?.end_rest).format('HH:mm')
      ),
    }
  }, [data])

  return (
    <Modal isOpen onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>勤怠の編集</ModalHeader>
        {fetching ? (
          <ModalBody>
            <Spinner />
          </ModalBody>
        ) : (
          <UpdateAttendanceModalForm
            defaultValues={defaulatValues}
            onClose={onClose}
          />
        )}
      </ModalContent>
    </Modal>
  )
}

const UpdateAttendanceModalForm = ({
  defaultValues,
  onClose,
}: {
  defaultValues: UpdateAttendanceSchema
  onClose: () => void
}) => {
  const {
    handleSubmit,
    control,
    register,
    formState: { isValid, isSubmitting },
  } = useForm<UpdateAttendanceSchema>({
    mode: 'onChange',
    resolver: zodResolver(updateAttendanceSchema),
    defaultValues: defaultValues,
  })

  const { fields: startFields } = useFieldArray<UpdateAttendanceSchema>({
    control,
    name: 'starts' as never,
  })
  const { fields: endFields } = useFieldArray<UpdateAttendanceSchema>({
    control,
    name: 'ends' as never,
  })
  const { fields: restStartFields } = useFieldArray<UpdateAttendanceSchema>({
    control,
    name: 'rest_starts' as never,
  })
  const { fields: restEndFields } = useFieldArray<UpdateAttendanceSchema>({
    control,
    name: 'rest_ends' as never,
  })

  const onSubmit = useCallback((data: UpdateAttendanceSchema) => {
    console.log(data)
    return ''
  }, [])
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ModalBody>
        <VStack align='stretch' spacing='5' pt='2' pb='4'>
          <Flex>
            <FormControl>
              <FormLabel>出勤</FormLabel>
              {startFields.map((field, index) => (
                <Box key={field.id}>
                  <input {...register(`starts.${index}`)} />
                </Box>
              ))}
            </FormControl>
            <FormControl>
              <FormLabel>退勤</FormLabel>
              {endFields.map((field, index) => (
                <Box key={field.id}>
                  <input {...register(`ends.${index}`)} />
                </Box>
              ))}
            </FormControl>
          </Flex>
          <Flex>
            <FormControl>
              <FormLabel>休憩</FormLabel>
              {restStartFields.map((field, index) => (
                <Box key={field.id}>
                  <input {...register(`rest_starts.${index}`)} />
                </Box>
              ))}
            </FormControl>
            <FormControl>
              <FormLabel>戻り</FormLabel>
              {restEndFields.map((field, index) => (
                <Box key={field.id}>
                  <input {...register(`rest_ends.${index}`)} />
                </Box>
              ))}
            </FormControl>
          </Flex>
        </VStack>
      </ModalBody>
      <ModalFooter
        gap='5'
        justifyContent='center'
        borderTop='1px solid'
        borderTopColor='gray.100'
      >
        <Button type='button' isDisabled={isSubmitting} onClick={onClose}>
          キャンセル
        </Button>
        <Button colorScheme='blue' type='submit' isDisabled={!isValid}>
          更新
        </Button>
      </ModalFooter>
    </form>
  )
}
