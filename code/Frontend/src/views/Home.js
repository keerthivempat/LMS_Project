import React, { useState } from 'react'

import Card from '../components/Card'
const Home = () => {
    const cardData = [
        {
          imageUrl: "https://www.thepostbox.in/cdn/shop/files/08PondiBlueLeather.jpg?v=1694161949&width=900",
          category: "Vintage",
          title: "Classic Leather Bag",
          description: "Timeless design meets premium craftsmanship.",
          price: "$249"
        },
        {
          imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSGJ7u2ePCopufmUiI4es51Bnbp40dNTaTSR9pC3UozHcLfkINJdqKqsjbRsh-16D3k8n1YvVfcv2wkFkUgJkqYt3h96D3YpCW4HDxBwK9-UJ8oG0WAVRO9-A",
          category: "Modern",
          title: "Minimalist Watch",
          description: "Sleek design for the contemporary professional.",
          price: "$199"
        },
        {
          imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExQWFhUXGB4bGRgYGBseIBshHyEfICAaIB8fICggHiAlHR8gITIhJikrLi4uGh8zODMtNygtLisBCgoKDg0OGxAQGy0mICUyLS8vLS0uMC0tLS8tLy8tLS0tLS0uLS0tLS0tLy0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAKgBLAMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAFBgMEAAIHAf/EAEEQAAIBAgQEAwYFAgUDBAIDAAECEQMhAAQSMQUTQVEiYXEGBzKBkaEUI0KxwdHwJFJy4fEzYoJDkqKyFXMlU2P/xAAZAQADAQEBAAAAAAAAAAAAAAACAwQBAAX/xAAtEQACAgIBAwIFAwUBAAAAAAAAAQIRAyExEiJBMvAEUWFxgZGx0RMjocHh8f/aAAwDAQACEQMRAD8APcHUq7VCLUlLerGyj6nDEpKUDPxBQCSerXb6DFfJ5QCgiEXqMGPeBt/XGntLWikVm5k/Ww/+OMzSu2FjVIG+zHFhmWcBSFR4M9e8YXveHmDXzWUyamDUqcxvQnSsj/SD9cM3sVwvlUCR+ok/Nrfthc9nKAzfGquaJOigCFv/AJfCD6b4yGjmE+PiajKDAVhbuEAH745pwpjmM/q3Got8hth59o6oArNIEyov1Nyfv9sAvdzwQmq/WSAP6/TFc2klERFW2w37y63LymXoCJc6j0uP9zht4HlTRyFFNiQCR98InvCIr8To0VkhdCEec3t6Rjp+fphTTpi2kD6f2MSZZXHQ+KpnNPaMc7ieXy5uE0CPM+I/xh39oSNEW8dUD5IP6jCP7F/4jilSufhUu+/yH2w2e1NfQgJPw0mc+RPX98OxruSAk+1s4tnnNfiTR/8A29OymP4w+e2tblZOoOrQo+e/84RvYTKGpnFY3iTfrho9uPGlKmJhmLGdxH/OGxdQlITJW0g17qcny+HV6sf9V9I+cL/M4De8X8/jFCktxRVEI7GdR+xGOheyuQCZDLUyPidWt82B+2Ocq3M4/Xi8VSf/AGqB/EYkm9MpOtcPOlXc7BT+xxyL2Q4QjcSouBcVC/0BJx0/jOa5eRrt5aR/5QuEj3f0/wDFa5+Cm7faP5wvFqCNfJMfHqfoa7NHoWYYRfafhbVcy7TsQAPQAYeqCnTTB66ifnA/n64XKwJrEi8vN/XFuV9qQiC22dO9nnFLLVHuOUgn/wAaYP7nHJ/dCrVOLB2udFQn5wP5x1F6ZPDs7ciVZfQEKhA+mFH3TcJWnnS4/TSN/VlwrI+5jI8Id8pU0ZfO1bGPxDeLb9VjjmvuGy4fNZprWoECd/Ef7+uHzjeY0cHzb76qZFzvraP5++FT3CUIbONEeFFntJaw9f4GJ8Pp/UOXI7+1lPwATvmJHyQLjl9SiGqlupqE/fHUfaTxcvsa1Q22sf6CcckXPKKq0xclv5w+Xpj+RT9THXOvppBlO1CqZ+R6euEv3PVP8bVLTP4aoZ37b+WG7jNQJlnAuRl6l+/998J/uhX/ABjnpyHEesf388O+J5QvB5Oxe1tsnX6fld+5F/TCR7CfC/8A+xNvnh69twPwmZsbU1+7D7YQ/YFpFTyent6nEOf0MqXI0+8dh+CJPWpT2/042931X/C0ewepP06Y094yzw4nfxUz9Rit7pX1UI/y1T90+2GozyCs245FTtqY384wF4DWisvnb6/zgzxhtOXzOwIbptvhN4Lnvz0VhILDFOX1xEQ9LOkcEIFSRb81Np7C5/vvgT7Q1OXxBz1WqD+xwU4ReqZJADUyPLbbAX20pAZ+qdQXxC3yH3wHxCqQWJ9o716f5VQW/wCq43/zAmPXCXxappqZd7Wpqb32PXDn/wCk21+S8Xm4C3+hvhH47QZqdHQLww+jHEL1m/A/wPyOeVVYxC1NY8/gf+uOf+21ZaedrLt4p2HW+HvhUnLsSPioKd9yEKn7jCD7zssWzgex10abbeUfPbFALOqFZYxsoCj9v64WPaTMBmC/T9h9sMYMUmY9Z/p+98KOTTnZkRtqwE35NS8DBmqvIyhjcISPX4R98KXu5pnL5TMVXsz1NCmL/fp1wxe21XSqIP1b/wDj/uftiPiFPl5ShTAMnxbbT0P1w3FG5JATdITPaUlkCjvqMYZPdllPBqPSWH7YQ/aHNOcwVQ+EQMdKylT8NwyozG+iFPWSI/c4ObuUmDDhIVPZGuub4w9RrQzNHpbDv7YcUFCjmKpjwoVUE7k2H3OFD3OcP0VcxWPaJPnfEPvfz0UqVEm9Ry58wth9z9sIS2kMb5Zt7p6FqzxvpQfPF33kZ3Stff8ATTH0n5i5wS92WR5eRpMRd2LnzAsDhO94lfUFAnxO79rTb98VwW2xM+Egb7A5caqjjcKR9f5wU9pCOaizcKFHqT/xjT2Dy/5bN3YD+cDcpmGr8YpqDYVhE/8Aaf8AbHZNY0vmDHczs5TkpSLfDQpMxPSVUD+Tjj3uvptWztbMtMOGItbxNGOo+8TOinkM4/XlBN4u5iPW4xz/ANysilV/yhrH6mMR5fQyhcjf7eKBk0SYL1Z9QAb/AFjAX2JyoRcy5O1Aj/3Yte9DPCmctRJFkZvuB/GK/sxWH4PMuD8TU0t6yftg4LhGNm5SACD+jt3JP8D74Xcpkm5i36j98M2dOmm5JvA/+v8AVvvgbwmoGqIInxDFWVXNIRjfa2M/FW08MqgAnW8X6S5IPntgR7tlIfMH/wDzEfWf4wZ9qCFylEf5mB+izEepxQ9j/hzTDpT272c4nk9tj0R+2dMf/hgsjxvTFx2lsa+5HhoQZhgQSdAn0kkHEfvLracrlKR2JZifQKB+5OCXuccHL1mG3MCj1Ak/Y4Ri4Rz9RY9pakJTNxasxXyiZ9ccG4RmVbMU+5dbn1x2726r6MsHiy0KhE9SVO/2xwf2bH+Jo/61/fFlaiKfLOme01Q/g6piPyXiPNlUzhf9zVQDOMOrId9owd9q0P4Cqb/9JflLj/f7YXPc8I4iLf8Apv8AxY+UYP4nlAYDtHt3UjJ5nrIT7sPthJ93imKt7a6Z+c4dfbxZy1ZSTH5UfU29MKvsVQC8yOpTc+f9n5Y8/wCI9DKo8hj3nmOHsI2qUx6eHp+2B/ucH5NXvzgRbaViftgr7w6JqZK1vHTNunhOKnuryxp06xP+dL/x98OXgzyBuLqTQzk9O3kd8c4yNT89P9Qx0jMLKZ1L3Jj/ANx3wjUuEMrhuxnD8z2mIxrTOlcKtWM2JCkk3/V9j0wP9u8ij52rNm8J+qiMXcipFba/L6b/ABA4r+8KoRmnCgAkJJH+kXx3xHKNw8DXlnmgWmZoITG50sbnC7maYCLA2qVB95wwezqasrTm80GUxY2gjC37Q5g06LFRJ55t2kY8/LrJFlK4Gj2eOqiPIMp876vpfA32l4QKrUW5gSKKiNM7FuuNvd3nDVpNNiGIj1Ub/TBXPU3OiDphYjfZm88UtA+Dzj+aFHLDVG15t5fz9sUvYygGY1LR3woe9ni/NRKVNW0j4pU7jpO3XDH7E54UMmoam8kdATM/fA9Dcqrg7qXJF7Q1TVzURsQtuvfFvjbS8A/AAPkLYHZGnVFbXy3aDqiP5OPczmi2pijqWaII74owrmQnI+ELP/40nNII+Jt8M/vQzRp5ajQUiGMsP9O33x5lPDURijG9iFJwu+2mc/E5ttCyqgKIHbf5zhe+mw9XQ3e7yhpyjuP1tH++Ode83O87PGkotSAQeu5+5x0bhudbL5VFakfAs2O/yFxjlmSy9Spnlcgyams2N7ybdcA4yjK35CTT0dnytL8PklEXp0QPCOp6/XHKvbR5rKl/CoH1vjqGe4qKqFQjqpIglY+GLEb7jHJOKTUzLnoWtecWwxy6H9Sec11DNwKmKWUXafExn0wv+7HJa+JU3JFtTEHrY/e+GjNrpyTFTIFPTaDc74qe62horGsabt4YGlZ3/wCMBmi9RR2NrbCPvbzxbhlUDepmdPqtMxb5rir7kcsRlWaJ1VDY+QAI/c/PEXvFqF0y2XpozCajv4TOpiDf1k2wd9hk/C0UpVKbo0kwVPW4vGJZ45yfSkO6ktnP/ffnS3EdC25dJF9bap/+UfLDP7FZcpwqiWnVVzLEiDsqMBP0n54TPbLh1bOcQrVKNJ3LuTpRSxgQOnoMdL4bl61PJ5WlUpVRy5mQLm0yLRF7+uHYVcgcjpAX2szpTK1mU/qCiBb4wP2X7YAew+fZ6rSJKozDygYOe29NmyyoisTUqAlbE9YmJ6mcQ+yPAK9AM1Sg41gqDEHsRc+e+Kpw77J4y7aCnvT4ryTlqV/gZvLcL9RpxL7u6xqZPOPe8KB9Lg/OML3vPp1MznVCoxKUkBAExJJm3cnDR7D5TMZXIGm9FoepN4VhJH6TeLDEssUqoepqxX99+ZPNy1IT4aMn/wAmMfscOnucWOGSLkO09IgSPXthD95mSr1c5zuTU5YRVBCMVhd/FEbyfnhy9jTmkySFaZWkZ0rYEg/qPWNx9MbHC0kjP6m2z33r+HKvvqNAjSNh4gv8/tjh/AARmaR66x++O1e2+utlaquCG0g6hEAAzFt7jHLeA8FqtVVjTfQDJbSYt5xf5Ye8bVCuu7HD24EZCpE3WjIJ2JYm39PTC77o3/8A5GmLnwvby0nrvhq9uqS1Mo2gXLU5EG2mZIBHWfpgH7tshUp5tKhouVE3CnqI9Oo++O+Ii3s7DKjqHvDZvwWZZBDAUhc9J/e8YSPdnWqM1XWZjR/9r/8APlhu9s84XydamKbksyxYgiI+th++Fn2M4bVpB3ejWCnT4tJizA9v7viDPjlXTWyqM1yHPelmnp8OVqYkmpTFydtJ274Fe5/iVSoK4dY+CDO99owR9u6y1smEQElHU3B6Ai1vPEfu84JmaampemjEAlkub20jt1nywzoaaTM6r2inxbMGmmfqXkMbAeexwhUfaqSAabT6Y6hxLh1dzmKJRTqJAZVhqhkmT4v4wo5n2DziLrOXOmJtBI9QDP2wzOuBeN3YycLrS1Pe9I7dbKbH53wM95fGKdLOQ+7U0ae8jfy22wSyGUhKVQhgFBUxTaTKiekDb54Ee3+WGZrU6q0y35arsZMdTaZvg88XSYOKXgdvd9nhXyquIgalnsIwA9p6wXL1nPwh6bSR3WJxv7LcPz9Ciuim2iQVTwqST1JN7D5bYt8Qy4r0KlKpSaW8LT5fPp6YnfwryVJNaGvMo6aKXur4mlSpUCGY0kx0mRfvvjodGkPEOzHpO9/5xy/2I9lc1kqr1RRhWABZrW1C4Eye8Ww5Zjizo7B0YNP6YI2AkX8sHHG2c5pclDifGiuYSjS1sahYKFCmmunctI/bDLRyqIpBMMQTr2Mxf+xhd4fllFQr+gr4YNyQJMHz2tg1mIaj4qX5irC0ywJluv8AfY4DFxzoJ/UBpna7Ug7GotNphWYayAbk2gDEVCtTpnUVqNIGzi09RvjfilQl6SWApgoYM38zF5wO5XiYaYEkgT2t/vi3p/t0TdXfYf4LSFRm1M5K3UE9Ox74tUqNOpVZaZNMqTqhVAj1icDeCUiE5oTVUBVQurubmZ2jvi4lLQxrKJZ2ZmBcgKB0sSN8JnzyNhwWaGWpLVhSRqt3uPPAnJ5upUrNRpVi5pkh3dFAUzGkQAcS0KP5uhj+XUi5a+rf7434fQIVqZheYzOCN2Cmyk99r4Tg3cgpfIjz/D+WQzu5uSwEAtBjY9MC8rxXLvqOXolCLOz00vPS0yT3xc9oKtRmUmNaQrLJiN94wDpNp0VKaOVYMzAt2/TtB7j0x6EY2lZK3TdBKvm8tTUtUpvUpyIVRTEGYiBE3Hfthi4TRWrTUjWtJxK0rLpBMCdPWcKFPLqzLQYPoaoqiG8QJGqfS5uD0w3pQADU9A5Wo6TqJP5Y6z3N8KzKnyHieuCh7Q8aTLVKOXFJ2aqPCyECLx45G3XBDKU0ZyGZmcQRJtGoDbtM4EcUXXmCatqlLLg6EJg7w02MyYjyxYyKnmCpvVVqdEKWhSQCzHzJX6dsS9T66T+47xtFXK8bpZnMVctQStSekxFR/AqAKbnw+I7WvecWOLFUqfnNVcQQQD10lr9hHTv6424bkwrCpRlqtas7NrMKqoTIMdJYeZwG4jmyajv4mVlLMAbQ50KVtcgRaRirDH6isj+hbGcTLq4WmW8KnVrIAGwAA+sDrifgeaXVorLUmUg6jALXi5kgAXJPXA3NrpLU2LMjMiqwN1JuN9xO/kMWuDANXVKqynOOnU3RAYkER1kDvGGzSSbFwb0gnxrPU1KUlp1CXA0mnUKDcgTA8rntizxDJU1porMXJOnUG30oS0R0kR6xgXRy6vm8sKquy8nmI0kLALEIy9WEdf4xHmcyTlkFUaTyq1depUSBE9xqtHT0xDkpReylW3wFuJ5oDLrXV66QdMU2AnUJkg+G3cj5YjytOu+XRqhZR4YWAWOpgFmIF5knA7NQcs7iUqIaCl7GZ0jSLwSRe+2rywwZ9iqUzyyGpvTpqsyTsSO3wjfyxuJtRRklbBXE6FOjXLOahQhVCAKfFpmYNv8Af64H0eLanZqdTM6FQhlqFIuYAQKInvMxjb2ictmNeplQ1UUpvcKSQPOQDbpgNw6adPUarVEeppEKRq+KQQdoIH0xUo24tiG6tIONxFKZqVGRyAPhLL4PCL3X9XS0b429n+JVM69R059OiikHmMt3JEBAALQbkg7jA7OVSajE1GCs5UAAyITtEjcmR1GDfBcutPK5epTY1WqVRDAkagCxiGNhAx2VJb8m42+BgFFKYchWLQ1gRq8PVT0+2FTh/F2qu3iqnL6lUGpGpiROygSLH7YO5TMlV1pTLc1qmqCQVIPYg94+WFnLUzTWkdTPNU7dYUk7/wAYlm3HusdzoZHfLpR5ol1K65AUkCYmDa0404VnTXXVLrSLBVVtIZz1NogdMUsoJoUVprqFVaiuDYwPXqMeUJpLl2oqXLM8hpJAXqNtu+GdLe7MutUT18zRR6hZmFm0Bdxp3uL7jqcQ1fagUaSmo9WozjwooWPSSMBquYl/FUMM1T1FpPS1yfpjWkGWlRYuz0y4EGSb/Inftih4rQhZWmHcvxNXimxNOlr2PeJiYvfBqjVo0qOvXFMCSyibDvAJjrhJWoA+rmMymsx6npYR/GCuSCUcsGhnFQ1KcLLXO1r3tgMsNaCxz2T5PjrZlnNPX+HDBFqERqY9hYnviwtSjRqEPqZVYLpI/Uevn6nFLI0RSy6VZFTTUAgXDSenmLfQ4h4zVctWqa9IBQkHYbWg9YjCM1qOnX8/wMi920E14xzTWddVOjTKrBN2PUBRsNhPri+aNKTE2MGe+F1VtmH5nhARoF9OoxHzjG/EmLVNRqmnIWAVWdhcz1ODjF0tnOXmi1wXLNoqadBqKwAkWWSGJI9O2+LnEapGmoOWSstUJ7LaxufljTg9IoZVZFYanZm2J2UDyA++BPFMwi/iKQplUjSGiAdAlh998KxR0kMk6QL5IZ3BjxHUD/mIuZ+ZxEgkqYC1BYzMd5B+2PKgIFKodUmFtNutxvtbE9JTzGRj4XF2jYttB9MX+CPyHOFZfQtOpSVSW1M8sdvWL3xPXoimHp6IRgq6pF5ubb4j4fQhqmXCEU7JqkySBJv3PacU87W5lH/psNEsinVJkwMQZPS237f5K0yfh2XDK6sq+AEopO82Hp/vi/Ros5kohqUwqwSdI6lgYmcDUVglOqlNnqM8QGiy72JjBDM1jTdjyyeYk1D0WbD9umOxQpJe/wBzm/IucaqDWau8hi0GDtAAsdXlijSpBYTS3LKKszFzeSI36HHtWgSalIvAJVV1MdtzB7xjxkBpnxkcksRvYAQt4uAcehwRlzgIDVVFYEadbiT0WwBG/aAJwx5ZWZF1IDVpU10rqhW1kXnvA2wB4fRBpGuxD1AEUG8h2N7R1mdu2DeoLXWsFfVUqadEXCosEBfJus98T5Gmx8E0ilxOqTVqVAfGatOmF30wAWSdiCJM+Z7Yk4adFSnVWX5hrVGv+hSABew0ntv88Q1a+irqJEVTUczPhj4T5AEiZ2xtlqRpq9At4ny4OoT8dQxExAkRB6ziXGk5OV+/K5GOyzTT8OWKLqVMvLmdy2okgdTHp0+Ssv6qPiYA0lEm4Pxn+mGrNMqZavl6ZOtXCKSJ1DwyJ2n4rYXaKcw20kipEgwSEECe/wDxizEJyEL0Q1Tky+k1xpJ7hJKG8i2qN/vi9wDRUCM4kinVcahMgDp0kQInp2x4H16aitdXYtAHQdVO2247+eLOToAq9bV8NEwFjc9SO0sLbEWwWR6BgtllyKiNUqnS9PKfNR0qi+95nFTjNTUpcPoenl0SGJIEsRrK/wDcD1nbFzOsx/E1bRoo0whETJAYMu8QSQJ7b4F8a1NVzVRqU03q0UBkglBADTNgpWYgSbHEmSVR/T5j0gw6oENYkNT51EFRBEKB02LdZtAjtglns0mtKrEgNUhVnoq79pnr54qUahR6St4qdXMufhjQVWJJO6kQelyPPE9ZJrUabAOhr1mSAIEAggzuLzA7DGw6elar3wa0xe4pX/xD1HIFM1lIUgWgQCDFjt9Tijk0FMhXqIyNVLKREecREG8HFms6moRpscydLSf0yAYj4dKx5Yj4VQBFMFb8wmxJ7Tv5QMWrSRK9smgCoqs4NNqjlbCx094nrGGDK0FoU8s6S4Z4iCZlGMgdBAm2FvJEltOgyC8QDYdVPqf2wzZBHprlTWb4VYKIjQdFgBJm1rzvheV6QeNcmcPq8kUmXVUWoak3JAgjyJH++BLVFplGJ8BqPFp6+Q8/tfF/2aquKeWNbTTkPCztJWxPVib27HA2o45lMANo/EVdGk2gkjxW87RPTEeeWve+dD4oKcKqU6Aou1QlX1gSwItFlxtkSKTUWdiyk1ItMR0tPS5xBwQkfg+ZICrUidv/AD7N5euJ6OYINPWPDFeI2t1naSdvnhqujNAF6uokF0ALtpPaVnoY64hyxcIvMCaFqDxROxj5Yj4dnWdEmm4JqMIJuIE3t16YlyNdjSAYFSzi+/XqLRt54qi2SySs9pswkHRo5oKtYWOwnvB/bBzhGXNOmtRmXStbqOh64CZivPOpsp/6i3ERfrgxwpmZatPw6VrLq8riPKO+ByN0HjSs9XUgdgAaS1wQJsAW+MDbqT88R+0lU6q+lda6QRE3tHpbF7OZkh8wgQcunUQnuSdJgDtcYqe0lBVZ4kI9Azp/T5he8CbeeJMktXoeolXKq5aqFSAaKuZBGqAPCTtI7Yp+2GePPUpTZw1NSSqlhN7SMT+zzkVECHVzcqfAYAN7sB/m2nEmc4JzVosKjU/ygCJIJILeI33OMwzXQv8Ah0o8jXQTwkFiQGtM7Lbc+eA/FKuqqqlkjTDBqeqCbk37iPpg6pjTaxHwjadzhbzFKrVNUgUhpkhiTJPbzEY7GtjMj0QLBDIWp2MqSsE9oMXkYuZPKmqVYml4dwIG19h1HniKtSraEqkUt4jSPlI2wRyeRdNTFVOsRE2M77bCMNlKosVFWy5IhX8AsSf9TW/s4q5lvzCIpwYGomLD/fpixyzqMqI1CBfZRY798DtBcEcs/e+o7YhzPSRSgtkaekaTpBCkiD1PbEPEaumkQApYkLBO46+eJgkiNP6gOv6ev2xQ41mACgNPXYmJiZPTFGNbQEnoGtFnjLyLlbkCOsfbEetEaP8ADsj2YBTAJ/T3+WLlEU11K9JtREKpBO9wPPGtM0RTZOUTUmSdJsRFz2NrYfYmi5wrLqgiKTK7gzeSEFmuNwQBHTF7LoNQlRqVWYMG/wAxuPnEziOgKaUbiNNMtPbV9742zaUxROqYIVGjf0++JpPlj0tAevw4VlK8lpFLSYcXDG++xG84LUsopapCOCWpKZI0+CCCo6DoZvOBD0aL1pp1Kh1VFsJBBQXS3S0nBzLvTBDh9QZnqE7wNiPQT9sIwrTYTKnFtApITTcq1aSoMXktJ+d49MAaVBEdWNCsFdnKhiFYG0m1iTeBgtxcUkFNHqtThGi0jtqbyA67ycB6GWoCmUfMQNEAwSe+rfz64vxaRPk5NloFCJy7nUraZqaSAxiJ2JAPXBjJ5TSlVatJ/Eaak28URBH/AGzufXAGjRpmk1Nq0PpQBYPTpPcibYO8FpB0INUsGzErAI2F6e+wEntjMz1R2NbJs7kaepw6VIq16UFYM6IYf6UEXNjgXmMtRLVlJqBmzWoSoKlgZ0iNkPc/0wUoqXNKK4g5liYJGoAN+UnkOvkDiimbrko/NpN+cwbSRJUSAvckHeB3xFleh6RYy3D6dRaFN2J01qjKpQjULkof9MyO4AxJU4clVssGYQoc6CWDNJBBHWO59O+LeSrV3Wi7hQ5L69OwMeHr5DvjXJ1a7cpmWDy2ZoH6p+C5thsZNJUwXFC7WydMgOtYF1qGQsgw0SNU3gR9setkUIQiqS6uTsQdr3HkB9cXlqVqWmrylio9xIIEzAttb9sSitUptzjTUh22BBAgGNp6YrWSXzEOCBGZyNI8pkYuyFpkR3Mg9bnDS+XSolIsJ0I24/7QJ8j/AL4EjM1Mu6NykioWMahbyG/TDBTq/lo2gEwZAI6DbC8snSDxpWyhkslTYUbhwgaNS7yRLCfTfAjO5KkxphXnRUJAhhu3cdh3wwKTqpwsCCxB6XHhwOeppYOaVmYn9tjGJMrdL3Q5JGZTJIwy4JDaC5hpMk/qHpiQcMpsKS6gVQ1PCZ8RP6vliek4/LZaZALNYmI/5jEysBBC31sPSZ+x/nDU3XJlIUqnD00gmurur6mF5uAIB62xHTSlyqi/iNThpEoehB0zPcYu16IRqlXkEoSIBJ6RNxiGll3LVKyUByxcAmRtJtbUJ7YqhLXJNKO+CHMZGmUrJz9Lk6jIfYSdMja/bBTgNCeeKtXWtRVhIOpfmP36Yq1VD/mciAV8UaoJ/j0xf4bVSpqdabIeWdUG3TYxIOAySdBwirJnyqLUrrzSA1FfyyLJv49QGq/raMRVuGIvKKuqKyMmlyTqMWIJk+vli+yLztRptqajBboQJ8PrfFDiEVKeXY0X1aoABJKbTI67ROJcsn0Mcooo+yeSrJUoGo1NwqutQhg3ikQVMCR0gDBfI8GlTqZiQzdRtJI6f5SD88BMglAPRUUqtM067KpDWBaZ1hrhWi0dY2wzUcyEaoqrEOZkgXIBJ+czjMOSVcnOK+QG4nm2FBiwC1LIFUyV1nfyMYXXzoDhtbBTJNugt32n64PceyyX1VAhfUSxDGQbKsDtGAgy7FYFWmQrKCJ8VrtAj0t0wyCnWn7/AEAnVm2WEEqWYiBuZ1db/LB7h9QimdWrSk1BJ3GwEdBP1wGai0oSZ3KkaTvYC2GFspNTWS36EA6RuZwWbrSS9/sDiSts9zOeijrOoNAUSLydzHS18VspnWV1MkhtRMXFtp6AY0rq4JcydRd9MHwxYfbGuSyjcgoCdRZVLQbD4id/liB9byJfIp1QWoVNDCkSxYrJbpJ/brgNxusOa1OdJWAL374KVaLsAoYhg/iYi8KLR03wt55qhq6ys7mSD4ugHri7H1Xfv7CcnFGyZ5mUNrY6SepBgYhq5qqsOlXcAAhryTcnpttOMWjUWofBuohSpvP9P4xZ4Plm/EaHT9U3B8MCQf7742XWkCqsZfxIUGqxJVmVVEdBEk+cyfpiLiOY0qllK1ahJkbAXBA77XxFTqulNtQBBFSqo7dgfPxYocS1BFFQANTotAF+gF/O2JMkpKDHJEnCs8yVFRlQDTUeywZmFUEdTeZ7YvZevFPlQq1BSSwXbV8YjsO04DZZByqhg8wJTpie7HoZsTN+2Cuer6VV9A5r1wsCJYqCN52GnvsMZilLpNa2D/a2rU1siIjFKSlSUk+JiDPQgABo9cDKuarNzG0qzI6IJRdhEsRYHcj5Dtjf2hzP+IJZirF0RlBJggTpFxIIv88UlqLrBWoxV6kmxBMSZjsDY+gxbCcq/wDeP5JppWEaeeZnFU0qcNVKyV8ICiFbeJN/rg97OZoPRpOtIUtRd9AkgRYdrneDhQy2kEDWzUyKjbHxDb4SYBABIG98MuWPJ0hASgyupmsCC0+M+cLtHphWXI9WMgixw7Mo34dlpBQEqVI8R0bAoLiWMkx2wEyNekDQb8PAAqOAXbwX2nrJ798XqJNMBVJKnKkkgGxafzDv0G3ngdReIp6/AaJ3PVpEydrR9sRZZvQ+KGMVqSrSAUqv4d3IBnSpAkeZGw9DjGZEhZeBliTtsf1f6o/fFDl8smgCCfwxiYnU1mHpGJHBXmUi2phliASLyR8J/gYf/UfkCgVRpUmID1XWzQdM9xJg9v3xtw7LrIHNpqPFEmNRkmRI7GfnigKpZLKAwUjc38UG0W6nEuVOvSAhnlmbzeREff8ApilZO7ar/QlrRayiUlccx+rwEEzc3B26ffDZTZeWpuAUaY6CL2++EnJl3YAKllYHTY7mCZ62JwyU1NOjBfVqpsF7zFvT54zJk0r/ADvg3GtsIZSqFNMqSQUNvKfi9cBUqqCPE+ks1gN4JuRPbG3Ds2UelzDP5OrY9/g+UTgFl8000gyxLHqbfLr0++Is2TSHJDRk2AFOGLDWRs0G3byN8WC8GdTEGrEecbX88AeEV6iLRNWL1GtMRYg2jFnmEOx1jl84RPnv9v64dHJpaMaKeaq+Oqpq1OWQNptvI0z/AMzinUqBazCnVqGkQLSQJi/hnqMQZ6u2qqsA/q1T+mTaO8TitQzRFSNM6gIOoiOn1xVjydl1+P8AZPNd1X7+QbGYK6eVWOgoZlY7eR+xwS4GfCNFZXmmfhHUdbjC3SeOUWAaUKi8Q0dbbQMW+Au6aAighgwmdt/vgpy7X7s6HqQ1031GlpawkHuT3g74o56tV/D0zTqDWreNiRcbGJ842x69VtGXdI1BoYHpa/7ffA/jCa8rJW9OoQR9dvM2xJOfayhItI9T8yoatMMGUkE30jcG1iR+2CPEEcsDqQAgRPb6HChVKk1mg/8Ap1CD1IIv6WGDWdoPV0OQ48AshEdcJw5l08MKSJK2dp846ioCqAJiPMj9sB6tXKvVZ2ZxUEiV2E2A7ScTmKiQxEgyPBJMTYkR98ZVF1qKKGrqAsH1jb549JImbM4PToE8vUZBnTFjpEzPywRoV5pF2LWRnFr/AJhOkx0I6eWNeGZRlL1CabEgCVg7nY9rTbrgk2WbXsmlmHb4VG/rO3bAZXcg8apAniNcgqodww0qbTsJM3vIIvghSCh6aiTKlzA3nab9O2ImyjOx8CE3Oqepte/bri+uVMOigAhQqn5dR2BxLjTcmxjZWL6A3jNk1Fo2JkycLSVVKtNZtQso8W/aScM3EVIpNpUE6gCD1At/YwFqZaqhWoKSKSSQAAQD5A9T3xbj4E5Chq1KH/EammdJ1TA8ydh3xf4RT8TVufrAS4lgQx2JncYhanm0eVVVZlEAKm5N/QAYK8Hyb05FRANThbgElYmfO+OnwdDkuZ12ABVgPhW/mRq9TpFsVOI5mutR9Co06VUE9D8Tb79hgiEl4ZZGuxvbSLN9TgFqR2J0vraoXGxU6fDPcW2HpiPLKlocgtlFanpXSDzHgx0AEyT1mBbzxNlxdFZZMs0gWUxBm+94t54H0XimhLsDTpO5BG82DG+w6L/TEpMAB3/6VElgZBkwA0/+J9JwyOlRgKzNZauonKu1VWLBgBaDv3kxAtiFSj01SllmBSWNrxHwi8if4xV/DMkMuZUtogtrMhiQdZm9/PElbKwfDmR8IGqWBG1z2JvEdMUrSEPbJqdMVQnLyunSDJHWSN/va++GOooIqryyW0BSAfjBHS/TvbC8nDVWpp52pDp2k7bDfe0emGTN5JStQ6oNQrcbiIGn6D74Xk+QzGQVkpim802BWiqk7yDsB3I3nAvMJQiF1DwQw6gCIInuDhgr5QjWyvpLBY7L5AbXE4qLlqtNtKstwu4tHUbTiXLG2tDUyPPZZGVyXvy6anUB4YMgn1xrmsorVKtXUuo07QSCpgCSOn8zghnMq5FSApllgEAgiBMz5i2I6+Wcc06FaVWFsJ2Fz5fxhjin4BsV6mWNMgrVUhk+JW3+EXm4xUNBEJYOhC0/EVY6dlA89h98F6mUqoWptl0qAqIBNz0md1gjbFWtl6lLmIcrTYmmoAa+rp07QftiiMI23XvexDevf0B34ZdQPMV1VNwCIBveewvPlhn4jS5lM6Sun8PUAncMQIbyHngMtNqbFGy4INMWaQTawEdNxhhzSTTtTDDknwkkSDEpPSRjsyWjcXkFUMpPJB0sVy2lfFIL9bbwe/8AOFyhk305ckqQrNqIdSRqI7GYJvPnhx5WnlzT0gUW1Sx8IEWkeu/lhVylSl+QeUwDFtKhrqO1xft06YgzxjooQQyWWDUaKFg0VGJ8Rm4NgRc4tPlUbWhaV56mNRkeGI8/TyONckKfKpmmH085iJiZ8W/3xuzqGqEA6uahMxckRAw1QjXBgD4nw8E1oqKNImNR1ArOwIiLC3riDh1BqzGKgLaYKloaBaVtuJ6+WNOI1VGYqQpuCGk7GTMHt98V6demalF6dPReLtJkgQdtunzxVCKq/oTS9Re4WtSqijUCwLCJAMXFvMeWCfsuza0UmysQIETEj/nAZatI0WqJrB5oZg0eEyZIIiBglwg0jUOh21ipJQrAEm4B+eAeOFccf44CTdoYMtlLaiWnmyR5T064jzuQcrmCpOotKgxEE3N8SLVBSoh1QGkSG9d98S5irPNp62XwzMEx/XbbE7xxqqKLAWdylZWWKYGqlaQCNQHwyDb/AIw3cPB5aSCDpEi2+E/I1lJpBq1SPGoXTKmJBa8GYt/GGng9ZXooymRH7W26YV8NGKujZCkpTwtzGABj/UT0I772xhrIHDarGIBiLdQfXFjL5yppZio03ggzOr4SfOOnniqmYeCeUdRtokbi1uhud8etZBQe4SFpkMz3q6qiKYgQIHW5OJFL06ZUsrVVUAeRc3ne4F5xHVrRTB5TayyUtFiw03JG4xT4nnFUrU0eOozMxCyQB4QCeg6+oxLOT2/4KEq0XMpUqMw5YGsOJloEKL7DBL8UyqjhNRclmgjwgDzPpgBkM0E5gVW1Og8QmNbTaeh2+2J1dVqVMqjH4EUXlgSTr328MYDCu2zWz32izGhlpeKyyW7ljA+4wLzvEWGpNRUrADGSCT/OKfEapeo6B5RaukOSCSqDr38cxbFCvmnc0vhIl2LadgswfUiPqcWwilEmnJuQbpcRqM2rmGQ5sdyFHf1k9d8NHBeI89JMgrPSJvb7YQzVkq5AAWntcXY322/2w5ZhnTUUK8qmqppi94JM97i2Ay9PAzHZYp8TFSi1cGAqEz0J3AvgVT4q6BqxKgBJM7Ek2HptjXibELVohFGXLpTBEb+ExbrJie+BXDjTq1Xo/wDpmoqQQSvgN1H74lyJNpLn8DU2M9Ti2hDWYeCEWO5PxfvbG2dz6hKtUqCkKgB3aehttfAnh9SjmGNFqZWnz3ZR4gG0DTA22MHfFTiuYUrVokMEWuWJGqIRTCA97Tv1xQoxugHJ1Z7XzdKkCrUlJaFDEmdjpt3AjEz5xFBU0kYs3hPUQJ1W7Ai22FulpqlNT3DahIYdLRO8RE+eJ6JWqabTtrbeDbp36RhtJrgTbsZeG8RAemrUkGqobkXUD9Uz0wZaomkalGmpmPCQdiCYc/8At288JnBKQrVKLFjphy8NeYLbddu3XBfK1kzKUEWpZXdqhB2gGJ6bHCZxTfkdCTrwF6ldDTqN4gGrEAyNxa3Zca0aiO16l+ZENIJifCD13wCasamXoIjiTWJawPcAn5YhyVZ3fLBQsmo7XmAd5Ppc/PEk496X8/qOUtDRmuc+kKwH+I8RVhZBIi/yB64jzlTMtTrwVUrU8BlbIN9pv698CsvWeMvy/E/PqvE2MA6p23kkeowKd0/BrF9eamYi8TF9/XD1HYDloNvUzbB6k0yVnQCRq0gNciw3jElQV3D1CyBlgJJFwBcR3ud4m2FDM1gAWGq9S94J3kWnaY9DjM5mfiAEzUEgsJFtxbbph/SJ6hsFVqjlmq0QQgABJG15+p9bjBWolSGQVEDcldMnZj+s+VhHocIn4iTUkWIIKk7SCN9o6fTDBnmY0syXWCKNMQDIMEkQfPA5Y1QWKV2GuSw5cVABymsTYvAhp3jefUYCU6VY8pHemYY6tUWg/oYD5YspXqGoGrLoByzyAdhaevxD9pwtZHMkChIAhjHXcifTEedUh0ZDPRoFaSnUlqlzaNzdSO/7E41z1M6mnTGpLW+Z2kGNj5YqZA1tIgKEFaBETBJ3+sYn4kanOcU0BX8otMQGnbvBHWMNjHSMchf4y1Xn1FKLBBKnQJgmAQd/vitQy1Slyi9JQGYWdQelyCDIOLHH6h/E1VhhFhAJBFjYgWgyIxFVYRSGpm8QMmT0sDPcYqjF9JPKS6mZQyT0krFk8IYsmtZVhqsD06+WLHDsvV57VAkUyQZItssj07emPBmSKVUEPBBlSWISZ8REbDvbG+T4nTRjdggVQZJI1R0AJ3MfU4GUZbNUo6GSmDqcEWjpO/l9sZl2kiw8VPeSdv7+2JMi1OoxqJO0MZIjr6G3XEWRzFKoy6WPwnvGkHefKR9cS0ym0CatUkaeUnhqXZRci30O30GC/B3IpABRYkbR16jvgS2eQGo6uYJBUx8RsNN/Oftjd+K0UZhVc6iZ3iQQIwjEpdbtb+wTaoE8yh4XJOpmIBDG4AsI2k+XfEvByi11Z6g2LQ5EyLwvkO15xWzGohg1EakApqAAYbyPV2nf174nymTpw2YNOpOsBFWYiRKhdiBBkxucenJ6Iop2HKC5hFfW6seWSjRcM+xj/fAvNioAaRZGeAgImBFz52ON61ZuctY1Ip1H8KHVsgFrW3wLy9Kpq0a1NSoLeRYnrufXEWddtX/goi9jDSSoaNFaYXWW5niJiF7wJ7WjGvOq/kvTpjUddaqCQJ/SPlBJA8hiClk2ocynzQ1QUoTcQWIG0ncdemNXSpTo16fMBqytNT0C2JG89xhsUloxtsW3UK7QDp8QO3xOZPWdoA9cbMaYZ1C6QFVZjqYtbr64kqI+kKoQMSC1zeDvirXqgsognxFm6zo2M7bj7YrXyJnotcHpc6oKOuQaog+L4V3AP1PzwzZGqmYpcqmxUmrLdwqtqEm8mAB64VeEEJVR6QMIj1PF01AqWPoD98NWd/I/DrTllWm7agJuQBrYjp4ifU4Vku6G4+Cvn6gqUqC0WWNbVHJBmQCQTHUk4F8FYuKLU1FODVrtqk6YEEnpecS8bRadXlIdJTLhGAELqYWYwIn/AHxDlqnKoVqKGXOVCCLTUIMGTtuMSO3kX+OBvgLcKNSquTNGKc0nqMH3BdhIO9zP74o8f4gv4eixB5bJUqVCD/nYDX3M3jywQoVly61aItUGXQTJM1NLEncxJK4XvafKuiGhSJNRaVIMxNtTGXMdFAg/LFMOf+C58FMZpVdAdRWnRLFuyncm2/YeeJKOZU1GXS0U6QJv0Mtbz6/LFfNmsOaq6mAWmoETcnxEneIjfzxbZtS1VBE2AIAmB1YfbD9XwIthDhlRkrkhCwShDED4ZF236Ai2C2azHLOXAWSMsxLAEABoAYjyE2xR4c8Jml1KWFLQvTVO/wC0Ys5yiyCqgbXpyygSI+NhA+UffE866noohdHlXLpRp5WFhtLs0DcGCGa3YmJ7nEXC3SjVywnSuglh0O4/p9cS8W5lMlKjamShAIECGtHqACcZwElawLW5eVYkbjTIj5/0xK3/AHdePryNrRd4DTFMZcsSGfmFpaQIMKZ/3wEro1OhljJJqVGLK36Qp6dR2J6zgjwmmtRsslRbJQZ1VhdpM6h6xI62wJzL6qWU+IKoqGSWBeTJjvEf3OKo3YqVUUlkIuliSWuCoJHWRAB++MrMw1XPidgZPoTE3BuL4qLD001HUdWxBlpIm/8Ae2N6fLeJg/mfCRvJEjtYdcPpsRZfoAg1GJYz0MRItBEeQww8cTUuZrIzGBTAQEabgfXf7YVsjVRzUQsNGvY7xN7EfP5YP8TzaI1fLhEVA9OfMBVtHa0/PA5U29BY2q2F+Kaa1VIc/wDRdgBFyIsZ23wq5UFlpSSsO02tB0mYP92wxcVNLLuukBVqUXUAQDJi4nrthbyqhaaWhg7A+cRH99sSZrpVf0+49NXv8jOagfK8pXCvrVTBEzrBn643NMoa6c0625YDncSfXpOKuSyVEZc14IIbVIJ3V72+WJszTo1mr1fF4aaksCRtfad4H3wyN175OAvF2almWBJcQQZHpB9b4pZdGWkp1CxUmB3M9z3n5YscXzCVc1IYqWA8QnoALjzxRoAiVJZfGNvIxA3mxxVD0ksn3BLh3ObnzyyxVgZ1AER0EG8YlyFRvxCflfFTUaTEOPEsknY7/QHrihlah1uqvoUg+MgGLdjYjpjWjmqiNSl1l0AQrcoZ8xtLAjfrjGjUx2erUVwKVEFSvxAqA1u32xq2tAvKoJJY6wNIienYgg/bEPBjmKbjnFGQixXvbuAe98aUstmRWJZvylqkzq3WLSI6SPpiWvsVWDuJ0DNQfh0B5Y0qNFhfxjpbt/2jvjQqDBejLRvpBn9/pjXP5POvUK1PCzq4pMriyg+VxuMDqxzrBOQQVCgGSu4m1x2jEkqjLlO/vr6Bp34YZZwiwyk1ApqWtpLWv1LbD/jBvh1HRTXVYqpaOn9zjMZiuYECPPFdMk3I07bEmT9pwMylFDWXSdZkNMbaemMxmIsjvJFDktBV1RqoqCCxYXK3AXp998DeJ8MU2QKajlnJBAJkmIJ323xmMxRGTsCSVAheEsvMWmpYr+kGbxfrcnA2nw6sabBFckU4MC0ne/l1x7jMVKTQhwTJ8ll6xp10CMQxo0kOiZlpdtvhEbmw6nDBxam9Oi1JW1u9WlSVj5kGD5AXtjMZhMpu2MjFULfHq2ta6PLO9ZaJi2orcAeX++LtRVOWqkAs1avSRx/o0tpAHeP/AJYzGYnxz72mgnHXIR49NTJVNcq1WqohdzDKpQR5KRgF7TVhVqlrqTVSVi40D4Z9d/7OMxmLcTt8CcukUyoVpA1M9QEmL+EAAenl5Yxwo0lAGJqjUQNxc7dpEY9xmGp7oVWkGcpRRaFetpDM9QKhC+LUT8Pfr0xazjh2zOYYMCGpAKSfCLBljaTBNx1xmMxOnbKKpEXHs0KjVaqkwERVFoMnqPmfpjMpl2bnVlfSqUgpWPiFybzYfXHuMwCj3N3w6/YxO6XzJKhdaqvTCxTyilnJ/TDH6i4+WBnHXWcqh1+DKyIjwg21Ed4HTGYzBxfcjpcMG096CCWvII6RbbHisqtTCBmGtiCIvt0P9xGMxmKW6fv6E64N6NdVVwBqOpSIG97iPLbDJnKpbL5nWp1GukrFx4Ugfx88ZjMKzPjQ3CuSRq61WAq0YCUKjhGHitp2tb1GFvKU1qLTQmQXJJBuJG/2xmMxPlpxb+W0MXKDfBcxTfL1Muzkh3jfqWUb9LjF18tTonMUix5fKEBiPM/Uf3tjMZhyWlsBS80LvtDkko1wo1FDTtNysgEH1mcV8soRWIZvim99juDjzGYfBtxETpSdE+Uofmt+YdLgG9xfeP32xDlKB1UyGhSNMMAfhgSO0i/qcZjMFYOhxzPCywoha2nlkpcfENht2j74tPwxgj0hWb/PJ32+EX+G22PcZiFyZcorkq8QyTo1D89iSSiSB4SRvbfb/fFLh/BmKkGsQVZl8IaDBIn4hucZjMRSySjN0M6U0f/Z",
          category: "Artisan",
          title: "Handwoven Textile",
          description: "Intricate patterns from skilled artisans.",
          price: "$129"
        },
        {
          imageUrl: "/api/placeholder/400/300",
          category: "Limited",
          title: "Ceramic Vase",
          description: "Unique piece with elegant glaze finish.",
          price: "$179"
        },
        {
          imageUrl: "/api/placeholder/400/300",
          category: "Exclusive",
          title: "Designer Sunglasses",
          description: "Cutting-edge style and superior protection.",
          price: "$299"
        },
        {
          imageUrl: "/api/placeholder/400/300",
          category: "Luxury",
          title: "Silk Scarf",
          description: "Delicate silk with intricate print design.",
          price: "$159"
        },
        {
          imageUrl: "/api/placeholder/400/300",
          category: "Sustainable",
          title: "Eco Leather Wallet",
          description: "Environmentally conscious everyday accessory.",
          price: "$89"
        },
        {
          imageUrl: "/api/placeholder/400/300",
          category: "Heritage",
          title: "Brass Desk Lamp",
          description: "Vintage-inspired lighting with modern functionality.",
          price: "$219"
        },
        {
          imageUrl: "/api/placeholder/400/300",
          category: "Premium",
          title: "Travel Backpack",
          description: "Versatile design for urban explorers.",
          price: "$269"
        },
        {
          imageUrl: "/api/placeholder/400/300",
          category: "Craft",
          title: "Wooden Desk Organizer",
          description: "Meticulously crafted workspace companion.",
          price: "$139"
        }
      ];
      const [currentPage, setCurrentPage] = useState(1);
      const cardsPerPage = 4;
      const totalPages = Math.ceil(cardData.length / cardsPerPage);
    
      // Get current cards
      const indexOfLastCard = currentPage * cardsPerPage;
      const indexOfFirstCard = indexOfLastCard - cardsPerPage;
      const currentCards = cardData.slice(indexOfFirstCard, indexOfLastCard);
      const paginate = (pageNumber) => setCurrentPage(pageNumber);

    
    return (
        <div>
            {/* <h1>Home</h1> */}
    <div className="container mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="flex justify-center mb-12">
        <img src="/mascot.png" className="w-32 h-auto" alt="Mascot" />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#57321A] mt-8">
          Our Curated Collection
        </h1>
        </div>

        {/* <p className="text-[#57321A]/80 max-w-2xl mx-auto">
          Discover a carefully selected range of premium, artisanal products 
          that blend timeless design with exceptional craftsmanship.
        </p> */}
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-8">
        {currentCards.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-5">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`w-10 h-10 rounded-full transition-all duration-300 
              ${currentPage === index + 1 
                ? 'bg-[#57321A] text-[#FFFCF4]' 
                : 'bg-[#FFFCF4] text-[#57321A] border border-[#57321A] hover:bg-[#EFC815]'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
        </div>
    )
}



export default Home;
