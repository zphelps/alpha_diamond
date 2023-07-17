import {FC} from 'react';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    FormHelperText,
    Link,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import {RouterLink} from '../../components/router-link';
import {Seo} from '../../components/seo';
import {useAuth} from '../../hooks/use-auth';
import {useMounted} from '../../hooks/use-mounted';
import {useSearchParams} from '../../hooks/use-search-params';
import {paths} from '../../paths';

interface Values {
    email: string;
    password: string;
    submit: null;
}

const initialValues: Values = {
    email: 'zach@zachphelps.com',
    password: '8216Buzz@',
    submit: null
};

const validationSchema = Yup.object({
    email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
    password: Yup
        .string()
        .max(255)
        .required('Password is required')
});

const Page: FC = () => {
    const isMounted = useMounted();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const {signInWithEmailAndPassword} = useAuth();
    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values, helpers): Promise<void> => {
            try {
                await signInWithEmailAndPassword(values.email, values.password);

                if (isMounted()) {
                    // returnTo could be an absolute path
                    window.location.href = returnTo || paths.index;
                }
            } catch (err: any) {
                console.error(err);

                if (isMounted()) {
                    helpers.setStatus({success: false});
                    helpers.setErrors({submit: err.message});
                    helpers.setSubmitting(false);
                }
            }
        }
    });

    return (
        <>
            <Seo title="Login"/>
            <div>
                <Card elevation={16}>
                    <CardHeader
                        subheader={(
                            <Typography
                                color="text.secondary"
                                variant="body2"
                            >
                                Don&apos;t have an account?
                                &nbsp;
                                <Link
                                    component={RouterLink}
                                    href={paths.auth.register}
                                    underline="hover"
                                    variant="subtitle2"
                                >
                                    Register
                                </Link>
                            </Typography>
                        )}
                        sx={{pb: 0}}
                        title="Log in"
                    />
                    <CardContent>
                        <form
                            noValidate
                            onSubmit={formik.handleSubmit}
                        >
                            <Stack spacing={3}>
                                <TextField
                                    error={!!(formik.touched.email && formik.errors.email)}
                                    fullWidth
                                    helperText={formik.touched.email && formik.errors.email}
                                    label="Email Address"
                                    name="email"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    type="email"
                                    value={formik.values.email}
                                />
                                <TextField
                                    error={!!(formik.touched.password && formik.errors.password)}
                                    fullWidth
                                    helperText={formik.touched.password && formik.errors.password}
                                    label="Password"
                                    name="password"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    type="password"
                                    value={formik.values.password}
                                />
                            </Stack>
                            {formik.errors.submit && (
                                <FormHelperText
                                    error
                                    sx={{mt: 3}}
                                >
                                    {formik.errors.submit as string}
                                </FormHelperText>
                            )}
                            <Box sx={{mt: 2}}>
                                <Button
                                    disabled={formik.isSubmitting}
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                >
                                    Log In
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
                <Stack
                    spacing={3}
                    sx={{mt: 3}}
                >
                    <Alert severity="error">
                        <div>
                            By default, Tenant ID: ParkTudorSchoolDev-fse0k
                        </div>
                    </Alert>
                </Stack>
            </div>
        </>
    );
};

export default Page;
