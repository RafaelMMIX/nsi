// ============================================
// CARTES COMMUNAUTAIRES - NSI HUB
// ============================================

import { decode, RAR } from "./tcg-share.js";

// ============================================
// BASE DE DONNÉES DES CARTES
// ============================================

// Pour ajouter une carte, ajoute simplement un objet ici.
//
// Propriétés :
// nom       : nom affiché dans la bibliothèque
// createur  : nom du créateur
// code      : code complet TCG1- ou TCG0-
//
// La rareté et le véritable nom de la carte
// sont récupérés automatiquement depuis son code.

const cartes = [

    {
    createur: "Rafael",
    code: "TCG1-pbjHDvZKziZ2K43ezEI_oJzG8EI55yzDC-VXOcc7muuYGzO-c7o9nn9hD2ACkkiKpMinikJV_R__5IYz_0dZ_WP4L9k0_ff_Vv3zP_45VE01lVm7_RH8bV5-__2_Vf8oz38U_8n2H8t8bv8Y_gvD_cOdx3nLpqOd_uFvbXb8hnn653_8s8yO7L-2Y9ZUYLdUzf-WZ3tFYP8B0h2IMYzj9anqNgzLOAzDOAzLMDyINXLiBSYfw6znQ6nqCwHDOALDMLLC_EXOzTDskU_uG_Qlp4i_NGoZGWP--At_mzDsL0HNm_lfIYdh6CP568kwvK87_0te_x809Glsdn846s-Nc99IHLI_iYl_pedO_5a1v-X237L9t4yWMgv94YK_5TcUVf4Pl_4V7zf9J7n9T3JXyOpf_n8lwT9HLofd_8jvL5yMNMLD4C-Umj-3gpENJmhYmRHUJArn5t_WOaEwDN_BfyL1f-P9L2Lb0WGYAwv-fCn7U4Py71ec98ff_jEMc-z0_xTvf8I7Zn_F-O9x-0vJpWPCMLY2MQxjRg7DCPQf9ZL_j_zZ__d6OObveoSCyW_2YqSCyRl2-KP3HPZkJIPRG6ZheIUxGOZh-BxEbpZnmFlm70Zmm1nhmEbnmlnnf43DN5DJ_6BQ_AmJ8lCDyim10gqj9hWX2vaQ5gmtIQiPyfek3WGA6uGCFxiUxxe03V1_x3Zmnbsxk__djsDepMYps_Xt5P-_6wJvhnE5hmsYm-EZT2GYn8Ayj8CClMPIf0EasH_3z_8DvVvhWSaQGIdR_tgFz58pIPCM44is0xjc3fB_96TCM4zjsk7iKb4gC6_KBpH4NLnsiWzwGpD69pkQK68DObAKNav33qUQqaEZJKgl9IvVUXwouGHYNoT-U7ssoGpQYNiZZRiF_895_aVjBIF1cvBhmE1wGI5xDJ5lBJ79M1L_JkfhBV8QhFZ4DUh0GyfwE9dpFVqAnEkGkYYxmFv4gwUvOAzIsHeXFlvXjV06h82x5hb0A3ghDCaI8omMfV_By2_LooLiUGBJnLH8CQhEcnRF_BpAoZWtI3Dw_NXil7qxsKW6gwCj86myqfhtOPTJJBlCU9gzBiPafUhTc9wOeLaGcG41awt9RxjBCmXwueVBOv7sWIxrvXBmWxfdbYCGJsKOJPiFEuoFr8TaC3DuH6LmmwpC0gGTcTqUmyn08OSd64H91OLZpU6i2OmRvKK4wki1bgtK8SwFpweA3WRPpFPvmYJh-3ELIomnUjo0oZ54f8BTiGFy5_jLCqUMwIwVQh9od_S6KAiPTLdBBF6t2iIZSk1U2QMYek-eACEd5mGwAcHPQhjh2isyMDWZJi0GXLArWwag6zIY526o-01A4VawiwiWBQysUdLCAosYWySNHc8EsgsOR_gPqClXtmykZMFbYVedTC8tvXanJeo8Rq7J4mvIzNiIXu4tyrunjPs8WXrXHpPxjxGhWCXBc5QRwsLGh5oIItI3-bW3mf4qb5M_CnX9Y_dvyKe1H30OLi2OCGHw5JuAR2AfMM209APwwHlJ9Pfn2aLabY7MYXVxhrsPVLOgllzZapa0hCDBlcbu-WEAkdT5TI_ER3UE4aQ7qALnD61aeqEAeb6QF8RNoL8BNLb3NE-6aQaJP6nXjm5P56JikL76lEgGjGp1eYYVtAJ6yZVtWylH8FQuNuGKZCj3y3QtavNRG7GysHbNqtMyRSmfsIMTIdC7FexBCIvMAb35NsXYf-Dr89h-wXVR933Cvj-OGfhTrpRH2BxgJciRge-iGKuj14Pf5d2u9UOXy-xLWws-QuPKereJ5LvAVKwE57mTfQr82etq11H4yAt0nenU55U7dm4xus79XstKlN6JL563e4ESYVbu5R5KiXCexfPuSeTZIqSqUqJjqTZIMdmW85mfhfpNsKac-0QT8m7MHQM3KbsPbhcWoGvVxzC4FgY86y8yemUnF5Js4dM0de9y0CPtNzBDLHqNUjR9M313_LrSqiSTPDHp4NG8i8XA3sk4oyfyqoEfmcXxMZfcqNThJkaGUyrVXOyIwZ4W2U3TmEkSAgzcA68WFsH0u9W3WtCeeO-5YUGz_Js63IAieBdgMZ1gBLryN3K9tkMNgTgKhjKMWkUhq-otzBjnyJp2qv_teaJe73aeTqXw_MM8Y-uVjxgFstv2m8kAUdxybvQiDrLRd35OqLfTl4JxhlWkKh0mMx62pwHr0FdJM4L-4BXYw2kLMFixjF-gWvrZEDdaDOveuM366ufRF49fLaR7q3lrVZ5k8IeoDBKFkyezTsiCZZZNwDUCdzu-DUTsn4t_4hY6w7CqGXvxUyE0Ix0l2c3Cc0_0bikXTMcFpBheT0FwVMA7tdM54M4GhhMnUMgEM748P-_jycNMNAp9DRygkGK4nZ5t7GWwHSaw2wCgAeNMe8LmUTdp9GQu67K9Vo0FzIMhxSIpHLukcn9OsJ3a0EZ8DPc1NU80FsyC3Du16XiS-7DKAljUpfxaixiDmmJ8xQ3UxJR4LPxEzhKPcgpsXq2tC3t3XPT7PBtZ572qhPrp0nq29MaV8SrmpJeBEu6SQBnJhtlI53LEW59-5FVeEyPNYaKV1Zzpx7M1knW29tSKlnp8mwMIlF756xNou1BdYSMgIKzU3LGll1Oj0F4qJj0dUXi6OIeSxE-XqA1ORnsRckpdZvtLi3pfPlLZ7XrJO_DiadgZujQk9kGG2ogFzD3_1eMQgWUA-sdOG7BFtzuWbEOaes4JtBiekm3Nzc61Epso8fyo4bH2S_VePhG79LCK3YWy6Wwh-QirNI4leJyNJOJEjcuXM7o9P6vYtjOKNql1oaNThc5dN5UZdW9e-q3EL0jIces7D7XeZMr4DLkRe18aGkDmGGoCNyINLlRiye96zu0BFa8cBYXBIptqPz4QALQtvESoi1xdwyQqZy_6vehpUOrzeQumMhb2n7UY7egz6FlZxIlk4M0kyMMnj3Ftot77u9n0uGQbmpv8RFhDYlYhYDvSXJ3JuO-wfrXHMC6VXUZT2V0UWhPqVCbLRQTcrCInhW2FCYUGSzDDQg1zdGR2CcB4ZiKf__RElI_xtG4F96R2SiuLMuQqAOKBWJ-M30F12Up30FsugqeKq4xF-93vNPJ-5WOhBUfYkW6rc0fkc1xylS6f3gMOJnOzY-auC3EDgy1mya6CmG6wp2dff4roSxVBVeTUls8fgCwMVEW-0pybVzYGuXpUUU1igCvDGNL6UboHGQV78mjE9LuKUJ5JIq4RE06iYKfmzi-DoT6aXKVZMxSHHOWj9tz5l8EtSvycN9tlthhRCIzR0_o0hHDflThMN7YzDG5Mk495Nswlvxuizgtzz7C1Qrugcd_7_stZ1J03kBGIF26RvGLCHyVS5eJHzElm2XviehZW0O_p5cZFhXDO6wzgLEK8YD7fCpNUVvnQzRwVkX7X-ZpBU_F72OWwfH9_xEg7iiUL-PZkV8rTICkgxyuHiy9u3KnlXFz7pWS1qNmmQVAf4879kSsuRz-YDDKwS4DgGugwpGFhFz9d6Js-Mt-54JmcxeGU3Y9w2B9DoRddwEGuqf17XRLYgMwDjTeeWjowEoNAyq4Qk38xHwoW7GUXxdQ13qzEF-oriKJAZiPwD0YzwIXllel0qgBvBoPa4QVlm8Kg9tx3ycSVIEDA29QP8VvD07HkWCce3x8K423SlGIgMJHJ47gIuP7X7H02wjWXly51UZp79tMkBZepQIB78gpwNd9f57XEsHyNnvXEp2tYSrblxl7M3A8U4GibTndXeXK9VEQbY7pfbcZKSdgDtx-641ORSf2pocGejEX3fX4JCQkAe9SQ8ZtlaJBuZvkFX6S7mwQKvmT0j_IQexKkcokB1WxlKOcmqkoN2ucnlhZfhTbvVT-iGAY9XcHK1kJfLQplUdCz5PBICyXKArivW8d7lhCIY4IxsgGXcfaposhmlJuvyvtiVmyL14YFwuVmSjQTNW-nKHOMajq_r3qlT8NgdA2F4n7uw55nEdzxnsZesn07bEcAZsy3WfCWEdY7WtKK-CSxfUL5BLGR3DPu6YI1aKq-C4PJX-Wb-gSNbUt6aiMUJiV3saKuX5qQo6FrbN_97rXrJqMSkma_-PsLWolOkVtiFMp_F7Nz6340F_PiC-f1dGYfqw9Obh_3fem8FfVXzE51AhILmBgwrhFx6VPgnqWDYJXfyypIB9iobB4ndPzMX9NjZbnfver6RshDLOeEeLExE_jd1-UT6_JnvMA5WwVE58iH6mKYOo47WfWChbPxy7Lf3N4unXIP8_St01QXAzQHTmxTF2loa4d0Qi3q12M33zFP0LgxPcZddzZz2J4MmFrsNBBapOavGkeZxeFu_EoplW_yxbLsKorHQpPysiJFSITpAZ0oz0dUXf5-zzedm4ECs49CCGgANFYwdujDeIZCECl5aoB6AurcaPgWDN9h4LWyxf0i_RX66nk1MktxRrspirrG89ZkZCLQMCwDu7a9sBUVYIDSlwqo2lY72Y8hGJg0C7GcuQ4OkK2uY3xesXWCc5IATTE5cuRH_7slv87T4v-7N_9uSQ2WmM6RGxPrx0UcFH41jw4IY7idu99VEIL8w4LLuzFYQ3WZ0i4eanubyV5Jj3E9sv0wo7oSO49YcTCbYjYpe-WYKPSE5cuyPKmvK9G9kqoogyqkn0JC2Gro7YguUnmmMxOaubC6h-BzLlOkaHav4JkPCzFppGDUzF2FvLgTX3YhRE3nZxx2yRYtYkkqR_HddC-e-97HlZ8Se_NXN41jokd4TwbZPoOSemtDC3lm8b77x3e_KtQHVVHVPWNTY15frUhv1QbDbLSeFpbg9tLFl0vuKXjlm-IBYB9UY_2YhGuoHS5JM3bNm-4fUi8PW6mA4a3IJtke3GVg6x4O_IV6_5nedvUy0BBGjPExSlP7e3LNh7ImbOuUdT5LDnqB_CCqOX-6cpAhbvWOXoX1Mf5dmN48T76eFmhzwwlG1lepKwzznnDA4rBQhffjL8ug5-l-azV0CM85znd-hfKRtJzPMfHr0T58F-CG2U3K3Nsk6y6zp05yO3vGYcFolOWqREMcTxqIz_xCk7NlKbnifudrNBjgY9L8EWeLbNFGRIj5YDOStwFmsFiqvPa8mQChCpLYJ1UC7dmv1E62sJvJMmja-S3fCkzue_oL_ZwSZizOoxl89fqTXRidrH_hVMbn5hFn3-9Y9OuEbA0S_L5luUO7F0KALSaVICMHrRcE8ZIn4gvE8UNhTvbu5apupOZOcc1VDE5dmm1PqDUbQrtxIV1CXbdgPztouh47-oilbKFDAKg_N9LjcsPloJq54Ho-0DKVpfgXs20621Xe3Bcdp3eNBUy0_Z5zhBRFGtLJKhBtSPV9lS3RtN4whwTmJLzAHgwYHzkzWcklUrDgAtPuxkfQCYp4iIUH0DPgzT9L_f7sIJOPTkXG2C7H_WxC2qa6lQQZlXvRlbyCbsVdEV7c47NMUuZOdoUb_qQDBBp-P213pAJQ8DBuKNeHjM4ACIwJAFFfE66NiwEJ7ycR_ffx1Fii_AlzsJCd2hxVsJAmmVcjFwo8W6jLLY9td_hkj2_4JEmKHOsyAG_SOTz7TiwfWIptPFsoQTigkvelrHpcTbgOcfck22tcoZeNXIVc2RhlwiR9eW_eNMnoOAEYZ-sT8LPkWlsY7V2GwmJl72V0fYxFy0eC4BboeLE97i-1mwruCCJ4n695vlmSm2zMXQSLMw5n5KddcQow6n1djU5VCpx0Pi9NpY3lrkPODCmDPmUyFnQDgLXfnUJu3Khtz3ZJclTglXWA_dJovw0Qvh6wpQnCD8rggryY24Hw4mW_PI-2Ra6llZTAooU3w94WP4_Dv7hFpV5o56B2rMGjy8WcdMBmutqb1zjMd6ogLSLzUaSPiWZ9FsdF1jqsr4mCwhwOso2mwLHdo5OMX2umHWGpuwkoMtfD_8XEUcRL1CBxi82bNlGBNy-VJ_sRuB1pLUtDoQJBG4kjD7j0dLL4Mc_5OLdADQgyYl_DBDBDJil3lfJLNMkypsGVCcfv0j_vqhkyyKSPCzdsFvQ2pnPTaQu8mRK8-ciC5YKT1Z2sNyZBxi6Dw06FXUmUl2-Sl81AzTNP4eDcfsPLXfroAu_B6wdbuwSToE2np4bbk-1ppE-UZO4i6ZbnZbmPFqhqoU30I53F212Fc5b4_nwm55nK9AZfa3Bl9fVGLx0FydAejWXL7HpppIWJOMUw__XTj_B9pKQNoae0Lfc14xWm3apRiMN9rvJ9XWOYIl1GIuwEle1FO_TNy0YcFj9Nb0Z59exxlcrC7HY3s8mfmCBgtClWmdlS0dHE8RUpXc4sSa8sDgwnueJfEMY17dOv7bZ4X2nx1MiPnwhXK0JhGOcaMhRO6SRHDEhbRriVOwTgeuV0bT9ytZI90uyXoSo5J1UUl9T0p4NhwktxOHuXECyeYIHv3pyUCcOx00mxvjA8ui6qF19IRNEXQKgfPHNMo4UQjwkNnzrpCUYRh_adLjVvXoatFpYOQa8ZPSDGw30OS-L4XhYr3afFj1jI-8p3tmzXgRCHZ2vt5aL1Oa-wEuXZWiUPm3teP-5YYkYcuZXzKkf0-z1BD_N-_BFPB1SWnySgKMoihpihPzQo1gcbe3Yo0nsOG7-pGoqAoyn3EAXyNxUHj13DtN0QphMPDPxQI7dItpenm1BlWZY6FHUh6LMr3qazRIngqrzwionI2qHzez2pyxHhSTNLXNBMHhBrNyd0c8kr871bthqKSJpVwDTEtEDQ1hmOSRw0xQgOpbWubXzexO2EqW61A9aKMRycpD44_8WE8NA8lzqiLCPLpndoEr2W2wREPtzOhGvga7xA-rKG242VxbSJrLp-euTMtFLVmKF3QKESnXNZIbkHgdVb5lKOzsqkNPRHf2ZapL_dbab2ciWAiyzE5_Ohjt2vew_AUlpKyjyoZ1EYcM5KNpkWrLm6mAxtsIaKxTdT4z60aAhTZVVVBqlRzl5F6VDZSC5ap3K8vKxX0PeMLEaF8kncmj-Pt45ub3CpKnD5FaYPtbQ1Egb3K-ZAKMn3abEhbAzwyQwYTP6GddGn-gcn-ac9dqWtslq0n1colqLaZbv04r04RUWss1VUsWk_BoPKFxbojpdQEBmdx-0pAKFa33TbRWbCWynhO7ZAEqs0tTxJGXPOOtyuTqVNpjilFXnqm0NagWwltz1j9b7ekoZAZTc_qqze9bbxqPFLnpO5sviDN_rIr7XkypQzcYRhaJOncRoXJR9xbNd5YyXwD1RhRSXCxNDWr2V80xSJD8pyhTaxbNs3Uf2aX0y1jIIdp03L0ExQ-NN-18St-wn91jKpLLXPLEu43fVL1DBU1K_7QNc3gPm53Zx0fo9CJqFaNLxkpM8rVfK42qXnRNC-kQsBbSd56Zbf9zLhElkRERDh-RsvxUpeF5Ku9ankuWgKbCo1GB7m8ClcehmOLose5LMEqsjOPj3dFxZj61CA6rXjPl8E06zim8ib3LNil_hl-n21IJKCqaPRK1yK9jiTny5w-PJJ-vEgHHf7WRGba1P3vEgd2GrggawO9gtXmaq6-AnanZNCHYqZsUphNoD1jFNt5nS5QspmljJJAg_c209J1YC7eVx_KclmhtbfHbXC6wLbJPavbcPVly7RaN6_NvD_aSdvkLJGjJvufYqOsMjtpIPE448vGNl58t0vINBbXz8GHMKPVhZjHEdpeEUwNNUGHl9xK2ylZRskeZmi-xrADLZSlrq35s6NBIBph1cBD4ijqpaQ6MXM2BTCwNxad8e8nnEokvRCOBBUtqg4tolDl91rxm30q2sUosfDO6ztW6iMDkGSQzl7fl9aQjp-KGOUpu10jUWoJoKWXFGT7HCi-jx6L-vcKfl0KxsdwfM1T4SueYDwwQqrTFFANsE6N7PouEo1i3sYOqYKzbWNE8AueU56I6wyw7TNzLd20ow4uVDCKtUeR0vqGks7WX5n6zup-jNgfLUom_BsRBuQEq-Q8412r_pzfrweT3p7h1i4zyo5ra3wycsVIGEmnVv1XaYhR_5iJw7WjJrPQZSJySMrz80jDhdS9YwVRMkJaPUxg1r5uQpFhGRTTLWBIMMKdDuFhF7yIKPCNQXirp2sbU84R92d_LIX0fDF85VsRWw45Vb-FLaTpK8XqMrUDqvf4jnyInDXWcxADV9nr_Xpf87u932jFUwJdriWzR5bvLTt2rMxWSTM__3dQ12sz5wWa3IR8zILU5anUt8XW8DJxpZ-FOiVG7wsPURBUe-_V7KVd4XTVGvrK9c36FlJlPuu6WEe9GHvRxKRaJsZ-lobfZEtGgJM_Evxjy1MUPA4TDFmaEj_TBM-DbWMQ2xmX2srXQI2Q78UpQ_SLBIFZu2qoqFjZPAXqjo0Z8D-u-bN9p-l9ZE-f_ZtzAUou26LPnHJfx6s0LbDRXZ4paEu_7OqtaATy7Wac7yXXDpmYLhGPfeXqn8p-cOg6jV3MR-zKp87SPIZEVwz2So2XZ5obwoJg5ZcEyZPcHzQk6rq1QndqPb0DYNLRTpMiyYDuMhyJCw8TM_XyaLcW7Z_DzX4VW-BSAd9ES3HHl1m0EH7Z3BUi3hIYNj3zDU0XlXrb3DcETOoHY1CMSEaaOTFA9CERUrADMPi0NKU4tiyXkKCjCjzneRqI2eTg2s68JR5FYo0EJBkeYVEfYR3pzx0paqCh0X5SMRIPpZQUxfWKa2YX4ICv8zNn0g9lmTzLE90lVQB9qAY1ed-LfYtSprB3uOOT3q4qxZ1f-9FezJY-ojmVJ3uPu9F--DT0-2OrxaCQJTVZoeSj5KEHYdvaIPkjp1E3aiJlthqFJItwOZpHnR5HH6EXMNx00PxboWaaSVShj-94avXKbpnjrkFS7xB2FWrJV0przIKZnoa731Ey_L5hIyaRFcZUKY9jL5SOY8ImI7idYlYg-CFnH-RcD4tmXVlL9HfjfYricRID9th6Z8bH2B6KLdNN7lbXTFoLBWyaku9D9BifEpHV7YEFPvzwUC4zsGV56mSzry9eNojs2Y54tRqTGgebFyRFmYLKWtC7VDI7HX9-ufUBzU-_7p2hu9kbjB9vVi_UNtxDRqNTtQHhYcWALUp5q-NLShff9YhZ0i0llAcuHaKCUV5lemRopgHs6jYXFgUtR5EkP6hnLtJBo3jmNx1FwXHbcZXkquSkqsigdgKwTAoNnYJoKd52HlnGYdN2iIU_iHFQX4zr2Mls_-RAelFdEuRRJugrLb-Dozqu2nSqPU6xmM__OjdETjCGBEvWEXFhsjCglrP2WAO4kuVdVv-xdoC-sQ0zLAHCzV7oW0mOc_RKRTfB0tVcnp89mCE0-HU7vqItMecxp4VcUggpU7FT9X3KJRRED-XVipoYb91_tA6U6502aAAArgh8mMlyVH3MOBwRmDubs5OKOY04JMNkr7qdzuf8xB-uol2twmCRm4YnkqaoBDOsbzVt171A-DYlS5QXudRP5VwkpDXWelIZgZai50c_iTpFnuHdeSa9x6khP6OxXEozf0FiZBYjsW-Gi3OUvc8o1nqB9O5dPDS3smNBblgxT4NTh0vLLIEXQ0HTIKBBRXbAOnJhFturuaMayfjtkiaZqhlVGN5vM3u9AwZQWFEQ9QXRdEMbvgL2FhWfzcmvxDIz1X_eIsuL8fePa-pLYLDhghm3NRCggw7Gwv0I6Phz_97N8nT_qumtF505P4pKB3iNPiXKplfNncyrBzKCUvSOTnEPcHIhk2DCA3Ym--ZTpa7YKUh3qVD4kJv6IVPYInLjiAU--xuKWMJWkXgX6t3kWX_VYp77VuebuAz0eKPbsdZ_BHSJ_0kcfYXc4JzUdJK7-QCSbSM4rYYio3zLZ2c7cSmM-9c0ooyLC7HvhI9qMEKybJspXY0Vis1BMnNDiUeME3qZPlIDYExS4Jrmx5_dNuiinTnF2Zl2vKeQ9Soo_j0zjZtLnXh6IBDeEXkCUr1PDosvAWfWP_LXObpkhL7XpNlSs2Cu8KuC_Dm8flKF_ODhjx2nxWDu8YHzflK5_gVG9Mn0qQuY1Tm6nJ-Crqp81OyYIyyZGn2c5OQYShALzelc0YUiinYLkUE-IZGLPKebXkxkE1LaRr4GzUlXgTk7qW67mippcfB0jnfSfQp_RxyzKKs9nTN85LmNSiuP120x7DxsmdglAgTyjmUAGsUOIg9R-hOKgDLElnCXnjkqvyDuG7ZJqc_Yd9SASAnL2m6smt6_qM6BxNLvEnQGqSALMmKLN3TVWGUVDFiHVkqMOV5MAgXF3rKvsNms_vx9sY5W0ZYLefDuJ9nnseqOpK0CQwgXiJpVhYCQLedwb4NMtKfzi0OO6x7NVR-aT75PqTxx3XoV0164M20NpL19X3Bg9JXOFyFHoY2e3gICPtiOENpru7C9m2EmeIhy3CGiRZneTBXC0qHJ84r7RlG0O9lUKUq2sXPA7Q4NkRvUxM9xPEXa43MSiXE9NNbGMFEi0E9sGDVdtoTkWhIJL22XYZ7WYVm1Qb0Ou7HytMKQDJ6VZiWLfnsvIWkTU0xWXRYrj086eVF_n5CIVXffVdheQrTiSCG7h0FCNL9__7P__P_Ag"
    },

    // Ajoute tes cartes ci-dessous.

];

// ============================================
// ÉLÉMENTS HTML
// ============================================

const grid = document.getElementById("cardsGrid");
const searchInput = document.getElementById("cardSearch");
const rarityFilter = document.getElementById("rarityFilter");
const cardsCount = document.getElementById("cardsCount");
const cardsEmpty = document.getElementById("cardsEmpty");
const copyToast = document.getElementById("copyToast");

// ============================================
// DONNÉES DÉCODÉES
// ============================================

let decodedCards = [];

async function loadCards() {
    decodedCards = [];

    for (const [index, entry] of cartes.entries()) {
        try {
            const card = await decode(entry.code);

            decodedCards.push({
                ...card,
                createur: entry.createur || "Communauté",
                code: entry.code,
                index
            });

        } catch (error) {
            console.error(
                `Impossible de charger la carte n°${index + 1} :`,
                error
            );
        }
    }

    renderCards();
}

// ============================================
// NORMALISATION DE LA RECHERCHE
// ============================================

function normalizeText(text) {
    return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// ============================================
// AFFICHAGE DES CARTES
// ============================================

function renderCards() {
    const search = normalizeText(searchInput.value);
    const rarity = rarityFilter.value;

    const filteredCards = decodedCards.filter(card => {
        const matchesSearch =
            normalizeText(card.nom).includes(search) ||
            normalizeText(card.desc).includes(search) ||
            normalizeText(card.createur).includes(search);

        const matchesRarity =
            rarity === "all" || card.rar === rarity;

        return matchesSearch && matchesRarity;
    });

    grid.replaceChildren();

    cardsCount.textContent =
        `${filteredCards.length} carte${filteredCards.length > 1 ? "s" : ""} disponible${filteredCards.length > 1 ? "s" : ""}`;

    cardsEmpty.hidden = filteredCards.length !== 0;

    for (const card of filteredCards) {
        grid.appendChild(createCardItem(card));
    }
}

// ============================================
// CRÉATION D'UNE CARTE DANS LA BIBLIOTHÈQUE
// ============================================

function createCardItem(card) {
    const container = document.createElement("article");
    container.className = "community-card";

    // Aperçu de la carte
    const preview = document.createElement("div");
    preview.className = "community-card-preview";

    const visualCard = document.createElement("tcg-card");
    visualCard.card = card;

    preview.appendChild(visualCard);

    // Informations
    const info = document.createElement("div");
    info.className = "community-card-info";

    const name = document.createElement("h3");
    name.textContent = card.nom;

    const author = document.createElement("p");
    author.className = "community-card-author";
    author.textContent = `Créée par ${card.createur}`;

    const rarity = document.createElement("span");
    rarity.className = "community-card-rarity";
    rarity.dataset.rarity = card.rar;
    rarity.textContent = RAR[card.rar].l;

    // Bouton de copie
    const copyButton = document.createElement("button");
    copyButton.className = "copy-card-button";
    copyButton.type = "button";

    const copyIcon = document.createElement("i");
    copyIcon.className = "fa-solid fa-copy";

    const copyText = document.createElement("span");
    copyText.textContent = "COPIER LA CARTE";

    copyButton.append(copyIcon, copyText);

    copyButton.addEventListener("click", async () => {
        await copyCard(card.code, copyButton);
    });

    info.append(
        name,
        author,
        rarity,
        copyButton
    );

    container.append(preview, info);

    return container;
}

// ============================================
// COPIE DU CODE DE PARTAGE
// ============================================

async function copyCard(code, button) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(code);
        } else {
            // Solution de secours pour les navigateurs
            // qui ne prennent pas en charge Clipboard API.
            const textarea = document.createElement("textarea");

            textarea.value = code;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);

            textarea.select();

            const successful = document.execCommand("copy");

            textarea.remove();

            if (!successful) {
                throw new Error("Copie impossible");
            }
        }

        showToast("Carte copiée !");

        button.classList.add("copied");

        const originalText = button.querySelector("span").textContent;

        button.querySelector("span").textContent = "CARTE COPIÉE !";
        button.querySelector("i").className = "fa-solid fa-check";

        setTimeout(() => {
            button.classList.remove("copied");
            button.querySelector("span").textContent = originalText;
            button.querySelector("i").className = "fa-solid fa-copy";
        }, 1800);

    } catch (error) {
        console.error("Erreur de copie :", error);
        showToast("Impossible de copier la carte.");
    }
}

// ============================================
// NOTIFICATION
// ============================================

let toastTimeout;

function showToast(message) {
    copyToast.querySelector("span").textContent = message;

    copyToast.classList.add("visible");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        copyToast.classList.remove("visible");
    }, 2500);
}

// ============================================
// RECHERCHE ET FILTRES
// ============================================

searchInput.addEventListener("input", renderCards);
rarityFilter.addEventListener("change", renderCards);

// ============================================
// INITIALISATION
// ============================================

loadCards();
