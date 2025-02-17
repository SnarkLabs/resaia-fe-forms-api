import { BaseController, RouteDefinition } from './base.controller';
import { Request, Response } from 'express';
import { z } from 'zod';
import { google } from 'googleapis';

export class FormsController extends BaseController {
    public basePath = '/forms';
    public static employeeRanges = ['1-20', '21-40', '41-70', '71-99', '100+'] as const;
    public static partnershipTiers = ['Platinum Partner', 'Gold Partner', 'Silver Partner', 'Associate Partner'] as const;
    public static organizationTypes = ['Academic Institution', 'Non-Profit/Community Organization', 'Corporation', 'Start-Up', 'Government'] as const;
    public static referralSources = ['LinkedIn', 'Twitter', 'Google Search', 'Job board', 'From a Friend', 'Other'] as const;
    public static memberTiers = ['Platinum', 'Gold', 'Silver', 'Associate'] as const;

    public saveTrainingPartner = async (req: Request, res: Response) => {
        const trainingPartnerSchema = z.object({
            organizationName: z.string().min(1, 'Organization name is required'),
            website: z.string().url('Invalid website URL'),
            yearsInBusiness: z.number().positive('Years in business must be positive'),
            numberOfEmployees: z.enum(FormsController.employeeRanges, {
                errorMap: () => ({ message: 'Invalid employee range selected' })
            }),
            contactName: z.string().min(1, 'Contact name is required'),
            jobTitle: z.string().min(1, 'Job title is required'),
            email: z.string().email('Invalid email address'),
            phoneNumber: z.string().regex(
                /^(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
                'Invalid phone number format'
            ),
            currentTrainingPrograms: z.string().min(1, 'Training programs information is required'),
            numberOfTrainingStaff: z.number().positive('Number of training staff must be positive'),
            trainingFacilities: z.string().min(1, 'Training facilities information is required'),
            geographicCoverage: z.string().min(1, 'Geographic coverage information is required'),
            partnershipTier: z.enum(FormsController.partnershipTiers, {
                errorMap: () => ({ message: 'Invalid partnership tier selected' })
            }),
            additionalComments: z.string().optional()
        });

        // type TrainingPartnerData = z.infer<typeof trainingPartnerSchema>;

        try {
            const { success, data, error } = trainingPartnerSchema.safeParse(req.body);
            if (!success) {
                return res.status(400).json({
                    status: "error",
                    errors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }

            // Save to Google Sheets
            const values = [
                [
                    new Date().toISOString(),
                    data.organizationName,
                    data.website,
                    data.yearsInBusiness,
                    data.numberOfEmployees,
                    data.contactName,
                    data.jobTitle,
                    data.email,
                    data.phoneNumber,
                    data.currentTrainingPrograms,
                    data.numberOfTrainingStaff,
                    data.trainingFacilities,
                    data.geographicCoverage,
                    data.partnershipTier,
                    data.additionalComments || '',
                ]
            ];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Training Partners!A:O',
                valueInputOption: 'RAW',
                requestBody: {
                    values,
                },
            });

            return res.json({
                status: "success",
                message: "Training partner information saved successfully"
            });

        } catch (error) {
            console.error('Error saving to Google Sheets:', error);
            return res.status(500).json({
                status: "error",
                message: "Internal server error",
                trace: (error as Error).message
            });
        }
    }

    public saveCorporateMember = async (req: Request, res: Response) => {
        const corporateMemberSchema = z.object({
            organizationType: z.enum(FormsController.organizationTypes, {
                errorMap: () => ({ message: 'Invalid organization type selected' })
            }),
            firstName: z.string().min(1, 'First name is required'),
            lastName: z.string().min(1, 'Last name is required'),
            email: z.string().email('Invalid email address'),
            companyName: z.string().min(1, 'Company name is required'),
            jobTitle: z.string().min(1, 'Job title is required'),
            stateRegion: z.string().min(1, 'State/Region is required'),
            city: z.string().min(1, 'City is required'),
            country: z.string().min(1, 'Country is required'),
            referredFrom: z.enum(FormsController.referralSources, {
                errorMap: () => ({ message: 'Invalid referral source selected' })
            }),
            memberTier: z.enum(FormsController.memberTiers, {
                errorMap: () => ({ message: 'Invalid member tier selected' })
            }),
            additionalComments: z.string().optional()
        });

        try {
            const { success, data, error } = corporateMemberSchema.safeParse(req.body);
            if (!success) {
                return res.status(400).json({
                    status: "error",
                    errors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }

            // Save to Google Sheets
            const values = [
                [
                    new Date().toISOString(),
                    data.organizationType,
                    data.firstName,
                    data.lastName,
                    data.email,
                    data.companyName,
                    data.jobTitle,
                    data.stateRegion,
                    data.city,
                    data.country,
                    data.referredFrom,
                    data.memberTier,
                    data.additionalComments || ''
                ]
            ];

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: 'Corporate Members!A:M',
                valueInputOption: 'RAW',
                requestBody: {
                    values,
                },
            });

            return res.json({
                status: "success",
                message: "Corporate member information saved successfully"
            });

        } catch (error) {
            console.error('Error saving to Google Sheets:', error);
            return res.status(500).json({
                status: "error",
                message: "Internal server error",
                trace: (error as Error).message
            });
        }
    }

    public routes: Array<RouteDefinition> = [
        { verb: 'POST', path: '/training-partner', handler: this.saveTrainingPartner.bind(this) },
        { verb: 'POST', path: '/corporate-member', handler: this.saveCorporateMember.bind(this) }
    ]

    private sheets: any;
    private spreadsheetId: string = '';

    constructor() {
        super();
        this.initializeGoogleSheets();
    }

    private async initializeGoogleSheets() {
        try {
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    "type": "service_account",
                    "project_id": "formal-wonder-437609-m4",
                    "private_key_id": "4cac9939adc7ce7cbd3a1376619a97e53d06cbf0",
                    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDilPup+kTT66GE\nlORgpht6Y0oHvQri9vsy0X2rtYHuHCKM14h1wMrsv0RRlXitL6Rz2UcDnanieOyx\nt7Up+42s3basJ460Msuzrg4pNROivojFw4DXVgyVMtoqMZ6DEJzxqe9GynsaQJvT\nWm/dFRvgQGa4xuLXTLQMGqtw4YWPu+bcFPiQk5q6eiZYBe3i6Hu0rJ8OCjahg1vh\ng7pcPble2/OnVxVK2Nuper8K1XvkVbNCnJ5U6Bi+NPG4oLTTLWil7Iy/0pY31+a8\nvH9Im4tAQ20SC6oDRmEdZ3Cto52XGXuaPeG1YnYrmOo6tau+oMYh8h47zs8hipMg\nKiu+UnupAgMBAAECggEAJOtkW7ytMmAWoA/SwUd6UBBATnp90ksEK1z56TIDddTy\ncZiSYlLZEzJ8jf6Y/JSNa1hgEIrEKmQhzTjDNZAI9GiRYgPKu49QpHpxUZhAbCg3\ns7cOFghYtzGOCDSwQL2YP8MSJgAgMZWNeSbR9hLWc/ffxQPt5RRZJ2UWbPznp7+x\nG9ACH9bJy2ru89gf8yjGVWxwfEcv86fCUQ0Dv6LaClzxz5FxiB+bRiatY8oPyNR4\nt7sb3e8t46Re8ggk3GJr2zJGATvLKiNWl4wlCzqrptEgUs9bSOzmQ9hTP5nrTIDl\nkHuSGGeaus3N88pY5MMgaZBr7el6qWM+Oi3A9LWMMQKBgQD4cgMro2uBRi9HifU/\nNQvW10kkJic2EGtKxM7gp6z5/YdKdUs6M5ORkRJpWKREQSiEbRyK3PsnsSN5mAUL\nIBtPoPRw60wFvFfSAnP3hdIknLRO48r9zMuBtWurXdh9opN4kjvNPqZTFYi6XHMO\ntJ/kIBHub1oVTKEO/NZki0ncmwKBgQDpeMc2w1NnTDlcc/LdZVFv0NL9JF7be/kD\nsyUvUkcP7rM01Yc+HCJFc0xowF2PyfFXU9u6AhCmUL7wo1zhTePGrFiD8umMJyax\nJ4jkR6LY3+ukdpAd91CKLBWu8Enz2cPQDCsPWaOLpZGnuiI3q6UmXKI0YKOzBL+n\nCmVQrnuTCwKBgE4qOLsjCDC87yUXz3QacWYfh6B67H1C/y6f6uKdfnuMe2M+sfNW\nxMfYl61TOSNMSL4ZQhCiY9ZiEeIwpO2SJWWRIzbfoKRxVEP7h5bJoIrqToQ/gN8G\n7sQZWw2oUfN9Ed6uS2hQnK2pKcJQUda/l0qDmICmwfXPjSCVBbLOa+efAoGAGitx\nmQ/X33JJ07UjefGLaU8s9zcGcu+4f9OqzV0Zng2RhNCSckHRDZvY6rz1P9LQ/Irn\nzDfDCgFvBaYqGQ8UAwb6fP/TceRJj/3weDYXaNvgm/S2PsWj/3jljVBd2bmFG2Lh\nyLyxeku6weQ5Rag1wNENVXWno79ahCzEIoEMVPUCgYA21RhOWD4ib9Kec6ClqT37\nUut8daOdz2pfcqPoKqhGHXXlj2cJIsOT8jBP9bcX5OsnXsf/dHLbYCNIrSyBszCE\n3CoHAx/olqAlVPpFQVJo3MsuAbvuyI0+jVGbeZ7W7hivY3L9zB2rtj3T/RdSifiI\n3ynX5ljdt3tupB/rRkkL1A==\n-----END PRIVATE KEY-----\n",
                    "client_email": "resaia-forms-data-saver@formal-wonder-437609-m4.iam.gserviceaccount.com",
                    "client_id": "100126214597220982601",
                    "universe_domain": "googleapis.com"
                },
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            this.sheets = google.sheets({ version: 'v4', auth });
            this.spreadsheetId = '17-tRdPsgRaRHJCZJB1RUghB-fQUf3Udh2-wQsn464TM';
        } catch (error) {
            console.error('Failed to initialize Google Sheets:', error);
        }
    }
}
